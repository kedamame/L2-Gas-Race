import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'L2 Gas Race',
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
