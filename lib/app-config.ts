export const APP_NAME = 'L2 Gas Race'
export const APP_DESCRIPTION =
  'Compare Ethereum, Arbitrum, and Base gas fees in real time.'
export const APP_TAGLINE = 'Real-time L2 gas race'
export const DEFAULT_APP_URL = 'https://l2-gas-race.vercel.app'

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    DEFAULT_APP_URL
  )
}
