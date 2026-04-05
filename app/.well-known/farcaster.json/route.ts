import { NextRequest, NextResponse } from 'next/server'
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  getAppUrl,
} from '@/lib/app-config'

export async function GET(request: NextRequest) {
  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    (host ? `${protocol}://${host}` : getAppUrl())

  const canonicalDomain = new URL(appUrl).hostname

  const accountAssociation =
    process.env.FARCASTER_HEADER &&
    process.env.FARCASTER_PAYLOAD &&
    process.env.FARCASTER_SIGNATURE
      ? {
          header: process.env.FARCASTER_HEADER,
          payload: process.env.FARCASTER_PAYLOAD,
          signature: process.env.FARCASTER_SIGNATURE,
        }
      : undefined

  return NextResponse.json({
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: {
      version: '1',
      name: APP_NAME,
      subtitle: 'Base gas tracker',
      description: APP_DESCRIPTION,
      homeUrl: appUrl,
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#030712',
      primaryCategory: 'utility',
      tags: ['base', 'gas', 'ethereum', 'arbitrum', 'fees'],
      heroImageUrl: `${appUrl}/og.png`,
      tagline: APP_TAGLINE,
      ogTitle: APP_NAME,
      ogDescription: APP_DESCRIPTION,
      ogImageUrl: `${appUrl}/og.png`,
      requiredChains: ['eip155:8453'],
      requiredCapabilities: [],
      noindex: false,
      canonicalDomain,
    },
  })
}
