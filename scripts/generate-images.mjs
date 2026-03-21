import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Color palette
const BG = '#030712'       // gray-950
const ETH_COLOR = '#627EEA'
const ARB_COLOR = '#28A0F0'
const BASE_COLOR = '#0052FF'
const TEXT = '#F9FAFB'
const SUBTITLE = '#9CA3AF'

// icon.png - 200x200 app icon
async function generateIcon() {
  const svg = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="40" fill="${BG}"/>
    <rect x="16" y="16" width="168" height="168" rx="32" fill="${BG}" stroke="#1F2937" stroke-width="2"/>

    <!-- Gas pump icon -->
    <text x="100" y="90" text-anchor="middle" font-size="52" fill="${TEXT}">⛽</text>

    <!-- L2 Gas Race text -->
    <text x="100" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="${TEXT}">L2 Gas Race</text>

    <!-- Chain color dots -->
    <circle cx="72" cy="150" r="6" fill="${ETH_COLOR}"/>
    <circle cx="100" cy="150" r="6" fill="${ARB_COLOR}"/>
    <circle cx="128" cy="150" r="6" fill="${BASE_COLOR}"/>
  </svg>`

  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, 'icon.png'))
  console.log('icon.png created')
}

// splash.png - 200x200 splash screen
async function generateSplash() {
  const svg = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${BG}"/>

    <!-- Gas pump SVG icon -->
    <g transform="translate(70, 50)" fill="${TEXT}">
      <rect x="5" y="8" width="36" height="44" rx="4" stroke="${TEXT}" stroke-width="3" fill="none"/>
      <rect x="13" y="16" width="20" height="14" rx="2" fill="${SUBTITLE}"/>
      <path d="M41 14 L52 8 L52 38 Q52 42 48 42 L44 42 L44 30" stroke="${TEXT}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="17" y="52" width="12" height="6" rx="1" fill="${TEXT}"/>
    </g>

    <!-- App name -->
    <text x="100" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="${TEXT}">L2 Gas Race</text>

    <!-- Loading dots -->
    <circle cx="80" cy="155" r="4" fill="${ETH_COLOR}"/>
    <circle cx="100" cy="155" r="4" fill="${ARB_COLOR}"/>
    <circle cx="120" cy="155" r="4" fill="${BASE_COLOR}"/>
  </svg>`

  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, 'splash.png'))
  console.log('splash.png created')
}

// og.png - 1200x630 OG image
async function generateOG() {
  const svg = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#030712"/>
        <stop offset="100%" style="stop-color:#111827"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Top accent line -->
    <rect x="0" y="0" width="400" height="4" fill="${ETH_COLOR}"/>
    <rect x="400" y="0" width="400" height="4" fill="${ARB_COLOR}"/>
    <rect x="800" y="0" width="400" height="4" fill="${BASE_COLOR}"/>

    <!-- Main title -->
    <text x="600" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="80" fill="${TEXT}">⛽ L2 Gas Race</text>

    <!-- Subtitle -->
    <text x="600" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="${SUBTITLE}">Real-time Gas Fee Comparison</text>

    <!-- Chain cards -->
    <!-- Ethereum -->
    <rect x="120" y="330" width="280" height="160" rx="16" fill="#111827" stroke="${ETH_COLOR}" stroke-width="3"/>
    <circle cx="160" cy="375" r="12" fill="${ETH_COLOR}"/>
    <text x="185" y="382" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="${TEXT}">Ethereum</text>
    <text x="160" y="430" font-family="monospace" font-size="36" fill="${TEXT}" font-weight="bold">~2.5</text>
    <text x="280" y="430" font-family="Arial, sans-serif" font-size="20" fill="${SUBTITLE}">Gwei</text>
    <text x="160" y="465" font-family="Arial, sans-serif" font-size="18" fill="${SUBTITLE}">ETH / ERC-20</text>

    <!-- Arbitrum -->
    <rect x="460" y="330" width="280" height="160" rx="16" fill="#111827" stroke="${ARB_COLOR}" stroke-width="3"/>
    <circle cx="500" cy="375" r="12" fill="${ARB_COLOR}"/>
    <text x="525" y="382" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="${TEXT}">Arbitrum</text>
    <text x="500" y="430" font-family="monospace" font-size="36" fill="${TEXT}" font-weight="bold">~0.01</text>
    <text x="630" y="430" font-family="Arial, sans-serif" font-size="20" fill="${SUBTITLE}">Gwei</text>
    <text x="500" y="465" font-family="Arial, sans-serif" font-size="18" fill="${SUBTITLE}">ETH / ERC-20</text>

    <!-- Base -->
    <rect x="800" y="330" width="280" height="160" rx="16" fill="#111827" stroke="${BASE_COLOR}" stroke-width="3"/>
    <circle cx="840" cy="375" r="12" fill="${BASE_COLOR}"/>
    <text x="865" y="382" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="${TEXT}">Base</text>
    <text x="840" y="430" font-family="monospace" font-size="36" fill="${TEXT}" font-weight="bold">~0.01</text>
    <text x="970" y="430" font-family="Arial, sans-serif" font-size="20" fill="${SUBTITLE}">Gwei</text>
    <text x="840" y="465" font-family="Arial, sans-serif" font-size="18" fill="${SUBTITLE}">ETH / ERC-20</text>

    <!-- Footer -->
    <text x="600" y="570" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#6B7280">Farcaster Mini App</text>

    <!-- Bottom accent -->
    <rect x="0" y="626" width="400" height="4" fill="${ETH_COLOR}"/>
    <rect x="400" y="626" width="400" height="4" fill="${ARB_COLOR}"/>
    <rect x="800" y="626" width="400" height="4" fill="${BASE_COLOR}"/>
  </svg>`

  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, 'og.png'))
  console.log('og.png created')
}

await Promise.all([generateIcon(), generateSplash(), generateOG()])
console.log('All images generated!')
