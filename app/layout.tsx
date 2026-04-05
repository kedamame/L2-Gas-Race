import type { Metadata } from 'next'
import './globals.css'
import {
  APP_DESCRIPTION,
  APP_NAME,
  getAppUrl,
} from '@/lib/app-config'

const appUrl = getAppUrl()
const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID || '69d252ffecad884a3318a80f'

const miniAppEmbed = {
  version: '1',
  imageUrl: `${appUrl}/og.png`,
  button: {
    title: 'Open L2 Gas Race',
    action: {
      type: 'launch_miniapp',
      name: APP_NAME,
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#030712',
    },
  },
}

const legacyFrameEmbed = {
  version: 'next',
  imageUrl: `${appUrl}/og.png`,
  button: {
    title: 'Open L2 Gas Race',
    action: {
      type: 'launch_frame',
      name: APP_NAME,
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#030712',
    },
  },
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: 'website',
    url: appUrl,
    images: [`${appUrl}/og.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${appUrl}/og.png`],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    'fc:frame': JSON.stringify(legacyFrameEmbed),
    ...(baseAppId ? { 'base:app_id': baseAppId } : {}),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 antialiased">{children}</body>
    </html>
  )
}
