import GasRaceApp from '@/components/GasRaceApp'

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://l2-gas-race.vercel.app'

const frame = {
  version: 'next',
  imageUrl: `${baseUrl}/og.png`,
  button: {
    title: 'Check Gas Fees',
    action: {
      type: 'launch_frame',
      name: 'L2 Gas Race',
      url: baseUrl,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: '#030712',
    },
  },
}

export const metadata = {
  title: 'L2 Gas Race',
  description: 'Ethereum / Arbitrum / Base のリアルタイムガス代比較',
  openGraph: {
    title: 'L2 Gas Race',
    description: 'Real-time L2 Gas Comparison for Ethereum, Arbitrum, and Base',
    images: [`${baseUrl}/og.png`],
  },
  other: {
    'fc:frame': JSON.stringify(frame),
  },
}

export default function Home() {
  return <GasRaceApp />
}
