import GasRaceApp from '@/components/GasRaceApp'

export const metadata = {
  title: 'L2 Gas Race',
  description: 'Ethereum / Arbitrum / Base のリアルタイムガス代比較',
  openGraph: {
    title: 'L2 Gas Race',
    description: 'Real-time L2 Gas Comparison — Ethereum / Arbitrum / Base',
    images: ['/og.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${process.env.NEXT_PUBLIC_URL ?? ''}/og.png`,
  },
}

export default function Home() {
  return <GasRaceApp />
}
