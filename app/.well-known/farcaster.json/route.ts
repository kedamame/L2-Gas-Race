import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`

  const manifest = {
    accountAssociation: {
      header: 'eyJmaWQiOjIxMTE4OSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDMxOTk5REZCMzI1NkQzMjNDQTA1N0RkMjBhREI1NkI4RUQ0NTE3NzQifQ',
      payload: 'eyJkb21haW4iOiJsMi1nYXMtcmFjZS52ZXJjZWwuYXBwIn0',
      signature: 'hJNAn6bpouoeovQX3IHJsIQ8QPzK2oQCmxRthufLhV1mIg4S0r2XfHNmdiwqaMcVVMMri4KXc0h5LgB5mmB0FRs=',
    },
    miniapp: {
      version: '1',
      name: 'L2 Gas Race',
      subtitle: 'L2 Gas Fee Tracker',
      description:
        'Track gas prices across Ethereum, Arbitrum, and Base with live updates. Compare speed tiers for ETH and ERC-20 transfers in Gwei and USD.',
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: '#030712',
      ogTitle: 'L2 Gas Race',
      ogDescription:
        'Real-time L2 Gas Comparison for Ethereum, Arbitrum, and Base',
      ogImageUrl: `${baseUrl}/og.png`,
      primaryCategory: 'finance',
      tags: ['gas', 'ethereum', 'arbitrum', 'base', 'defi'],
      requiredChains: ['eip155:1', 'eip155:42161', 'eip155:8453'],
      requiredCapabilities: ['actions.ready', 'actions.openUrl'],
    },
  }

  return NextResponse.json(manifest)
}
