import { NextResponse } from 'next/server'
import { getAllChainGasData } from '@/lib/gas'

export const runtime = 'nodejs'
export const revalidate = 0  // キャッシュしない

export async function GET() {
  const data = await getAllChainGasData()
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
