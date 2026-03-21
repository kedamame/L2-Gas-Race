import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || ''

  const manifest = {
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    miniapp: {
      version: '1',
      name: 'L2 Gas Race',
      subtitle: 'Real-time L2 Gas Comparison',
      description:
        'Compare gas fees across Ethereum, Arbitrum, and Base in real-time. View costs for ETH and ERC-20 transfers with Slow/Average/Fast tiers.',
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: '#030712',
      ogTitle: 'L2 Gas Race',
      ogDescription:
        'Real-time L2 Gas Comparison — Ethereum / Arbitrum / Base',
      ogImageUrl: `${baseUrl}/og.png`,
      primaryCategory: 'finance',
      tags: ['gas', 'ethereum', 'arbitrum', 'base', 'l2', 'defi'],
      requiredChains: ['eip155:1', 'eip155:42161', 'eip155:8453'],
      requiredCapabilities: ['actions.ready', 'actions.openUrl'],
    },
  }

  return NextResponse.json(manifest)
}
