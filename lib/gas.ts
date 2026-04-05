import { createPublicClient, formatGwei, http } from 'viem'
import { arbitrum, base, mainnet } from 'viem/chains'

export type GasTier = {
  slow: number
  average: number
  fast: number
}

export type ChainGasData = {
  chain: string
  chainId: number
  color: string
  emoji: string
  gasTiers: GasTier
  usdPerTier: GasTier
  erc20UsdPerTier: GasTier
  lastUpdated: number
  error?: string
}

const ERC20_GAS_LIMIT = 65000
const ETH_TRANSFER_GAS = 21000

async function getEthPrice(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { next: { revalidate: 60 } }
    )
    const data = await res.json()
    return data.ethereum.usd
  } catch {
    return 3000
  }
}

async function getChainGas(
  rpcUrl: string,
  chain: typeof mainnet | typeof arbitrum | typeof base
): Promise<{ baseFee: number; priorityFees: GasTier } | null> {
  try {
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl, { timeout: 5000 }),
    })

    const block = await client.getBlock({ blockTag: 'latest' })
    const baseFeeWei = block.baseFeePerGas ?? 0n
    const isL2 = chain.id !== 1

    const slowPriority = isL2 ? 0.001 : 0.5
    const averagePriority = isL2 ? 0.01 : 1.5
    const fastPriority = isL2 ? 0.1 : 3.0
    const baseFeeGwei = Number(formatGwei(baseFeeWei))

    return {
      baseFee: baseFeeGwei,
      priorityFees: {
        slow: baseFeeGwei + slowPriority,
        average: baseFeeGwei + averagePriority,
        fast: baseFeeGwei + fastPriority,
      },
    }
  } catch {
    return null
  }
}

function gweiTierToUsd(tier: GasTier, ethUsd: number, gasLimit: number): GasTier {
  const convert = (gwei: number) =>
    parseFloat(((gwei * 1e-9) * gasLimit * ethUsd).toFixed(6))

  return {
    slow: convert(tier.slow),
    average: convert(tier.average),
    fast: convert(tier.fast),
  }
}

export async function getAllChainGasData(): Promise<ChainGasData[]> {
  const ethUsd = await getEthPrice()

  const chains = [
    {
      chain: 'Ethereum',
      chainId: 1,
      color: '#627EEA',
      emoji: 'ETH',
      rpc: process.env.ETHEREUM_RPC ?? 'https://ethereum-rpc.publicnode.com',
      viemChain: mainnet,
    },
    {
      chain: 'Arbitrum',
      chainId: 42161,
      color: '#28A0F0',
      emoji: 'ARB',
      rpc: process.env.ARBITRUM_RPC ?? 'https://arbitrum-one-rpc.publicnode.com',
      viemChain: arbitrum,
    },
    {
      chain: 'Base',
      chainId: 8453,
      color: '#0052FF',
      emoji: 'BASE',
      rpc: process.env.BASE_RPC ?? 'https://base-rpc.publicnode.com',
      viemChain: base,
    },
  ] as const

  const results = await Promise.allSettled(
    chains.map(async (chainConfig) => {
      const gasData = await getChainGas(chainConfig.rpc, chainConfig.viemChain)
      if (!gasData) throw new Error('RPC error')

      return {
        chain: chainConfig.chain,
        chainId: chainConfig.chainId,
        color: chainConfig.color,
        emoji: chainConfig.emoji,
        gasTiers: gasData.priorityFees,
        usdPerTier: gweiTierToUsd(
          gasData.priorityFees,
          ethUsd,
          ETH_TRANSFER_GAS
        ),
        erc20UsdPerTier: gweiTierToUsd(
          gasData.priorityFees,
          ethUsd,
          ERC20_GAS_LIMIT
        ),
        lastUpdated: Date.now(),
      } satisfies ChainGasData
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value

    return {
      chain: chains[index].chain,
      chainId: chains[index].chainId,
      color: chains[index].color,
      emoji: chains[index].emoji,
      gasTiers: { slow: 0, average: 0, fast: 0 },
      usdPerTier: { slow: 0, average: 0, fast: 0 },
      erc20UsdPerTier: { slow: 0, average: 0, fast: 0 },
      lastUpdated: Date.now(),
      error: 'Failed to fetch',
    } satisfies ChainGasData
  })
}
