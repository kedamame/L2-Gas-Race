import { createPublicClient, http, formatGwei } from 'viem'
import { mainnet, arbitrum, base } from 'viem/chains'

export type GasTier = {
  slow: number    // Gwei
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
  erc20UsdPerTier: GasTier  // ERC-20送金コスト
  lastUpdated: number
  error?: string
}

// ERC-20 transfer は約 65,000 gas
const ERC20_GAS_LIMIT = 65000
// ETH native transfer は約 21,000 gas
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
    return 3000 // フォールバック価格
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

    // priority fee の推定（チェーンごとに相場が異なる）
    const isL2 = chain.id !== 1
    const slowPriority = isL2 ? 0.001 : 0.5
    const avgPriority  = isL2 ? 0.01  : 1.5
    const fastPriority = isL2 ? 0.1   : 3.0

    const baseFeeGwei = Number(formatGwei(baseFeeWei))

    return {
      baseFee: baseFeeGwei,
      priorityFees: {
        slow:    baseFeeGwei + slowPriority,
        average: baseFeeGwei + avgPriority,
        fast:    baseFeeGwei + fastPriority,
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
    slow:    convert(tier.slow),
    average: convert(tier.average),
    fast:    convert(tier.fast),
  }
}

export async function getAllChainGasData(): Promise<ChainGasData[]> {
  const ethUsd = await getEthPrice()

  const chains = [
    {
      chain: 'Ethereum',
      chainId: 1,
      color: '#627EEA',
      emoji: '⟠',
      rpc: process.env.ETHEREUM_RPC ?? 'https://ethereum-rpc.publicnode.com',
      viemChain: mainnet,
    },
    {
      chain: 'Arbitrum',
      chainId: 42161,
      color: '#28A0F0',
      emoji: '🔵',
      rpc: process.env.ARBITRUM_RPC ?? 'https://arbitrum-one-rpc.publicnode.com',
      viemChain: arbitrum,
    },
    {
      chain: 'Base',
      chainId: 8453,
      color: '#0052FF',
      emoji: '🔷',
      rpc: process.env.BASE_RPC ?? 'https://base-rpc.publicnode.com',
      viemChain: base,
    },
  ]

  const results = await Promise.allSettled(
    chains.map(async (c) => {
      const gasData = await getChainGas(c.rpc, c.viemChain)
      if (!gasData) throw new Error('RPC error')

      return {
        chain:       c.chain,
        chainId:     c.chainId,
        color:       c.color,
        emoji:       c.emoji,
        gasTiers:    gasData.priorityFees,
        usdPerTier:  gweiTierToUsd(gasData.priorityFees, ethUsd, ETH_TRANSFER_GAS),
        erc20UsdPerTier: gweiTierToUsd(gasData.priorityFees, ethUsd, ERC20_GAS_LIMIT),
        lastUpdated: Date.now(),
      } satisfies ChainGasData
    })
  )

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      chain:      chains[i].chain,
      chainId:    chains[i].chainId,
      color:      chains[i].color,
      emoji:      chains[i].emoji,
      gasTiers:   { slow: 0, average: 0, fast: 0 },
      usdPerTier: { slow: 0, average: 0, fast: 0 },
      erc20UsdPerTier: { slow: 0, average: 0, fast: 0 },
      lastUpdated: Date.now(),
      error: 'データ取得失敗 / Failed to fetch',
    } satisfies ChainGasData
  })
}
