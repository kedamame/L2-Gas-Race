'use client'

import { useEffect, useState, useCallback } from 'react'
import sdk from '@farcaster/frame-sdk'
import type { ChainGasData } from '@/lib/gas'

const REFRESH_INTERVAL = 30 * 1000  // 30秒

const TIER_LABELS = {
  slow:    { en: 'Slow',    ja: '低速' },
  average: { en: 'Average', ja: '標準' },
  fast:    { en: 'Fast',    ja: '高速' },
}

const TIER_COLORS = {
  slow:    'text-blue-400',
  average: 'text-green-400',
  fast:    'text-orange-400',
}

function formatGwei(v: number): string {
  if (v === 0) return '—'
  if (v < 0.01) return v.toFixed(4)
  if (v < 1)    return v.toFixed(3)
  return v.toFixed(2)
}

function formatUsd(v: number): string {
  if (v === 0) return '—'
  if (v < 0.001) return '<$0.001'
  if (v < 0.01)  return `$${v.toFixed(4)}`
  return `$${v.toFixed(3)}`
}

export default function GasRaceApp() {
  const [data, setData]       = useState<ChainGasData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [countdown, setCountdown]     = useState(30)
  const [tab, setTab] = useState<'eth' | 'erc20'>('eth')
  const [lang, setLang] = useState<'ja' | 'en'>('ja')

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch('/api/gas')
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
      setCountdown(30)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  // 初回 + 30秒ポーリング
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  // カウントダウン表示
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => (c <= 1 ? 30 : c - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Farcaster SDK 初期化
  useEffect(() => {
    sdk.actions.ready()
  }, [])

  const handleCast = async () => {
    if (!data.length) return
    const lines = data.map(d => {
      const avg = d.gasTiers.average
      const usd = tab === 'eth' ? d.usdPerTier.average : d.erc20UsdPerTier.average
      return `${d.emoji} ${d.chain}: ${formatGwei(avg)} Gwei (${formatUsd(usd)})`
    })
    const type  = tab === 'eth' ? 'ETH Transfer' : 'ERC-20 Transfer'
    const text  = `⛽ L2 Gas Race — ${type}\n${lines.join('\n')}\n\n#L2GasRace #DeFi`
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
    )
  }

  const t = (ja: string, en: string) => lang === 'ja' ? ja : en

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        <div className="text-center">
          <div className="text-3xl mb-2 animate-pulse">⛽</div>
          <div className="text-sm text-gray-400">
            {t('ガスデータを取得中…', 'Fetching gas data…')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-5 max-w-md mx-auto">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            ⛽ L2 Gas Race
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('リアルタイム ガス代比較', 'Real-time Gas Comparison')}
          </p>
        </div>
        <button
          onClick={() => setLang(l => l === 'ja' ? 'en' : 'ja')}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-full transition"
        >
          {lang === 'ja' ? 'EN' : 'JA'}
        </button>
      </div>

      {/* タブ切替 */}
      <div className="flex gap-2 mb-4">
        {(['eth', 'erc20'] as const).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
              tab === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {key === 'eth'
              ? t('ETH 送金', 'ETH Transfer')
              : t('ERC-20 送金', 'ERC-20 Transfer')}
          </button>
        ))}
      </div>

      {/* チェーンカード */}
      <div className="space-y-3 mb-4">
        {data.map(chain => {
          const tiers = tab === 'eth' ? chain.usdPerTier : chain.erc20UsdPerTier
          return (
            <div
              key={chain.chainId}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800"
              style={{ borderLeftColor: chain.color, borderLeftWidth: 3 }}
            >
              {/* チェーン名 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{chain.emoji}</span>
                <span className="font-semibold text-sm">{chain.chain}</span>
                {chain.error && (
                  <span className="ml-auto text-xs text-red-400">
                    {t('エラー', 'Error')}
                  </span>
                )}
              </div>

              {/* Slow / Average / Fast */}
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'average', 'fast'] as const).map(tier => (
                  <div key={tier} className="text-center">
                    <div className={`text-xs font-medium mb-1 ${TIER_COLORS[tier]}`}>
                      {t(TIER_LABELS[tier].ja, TIER_LABELS[tier].en)}
                    </div>
                    <div className="text-sm font-mono font-bold">
                      {formatGwei(chain.gasTiers[tier])}
                      <span className="text-xs font-normal text-gray-400"> Gwei</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatUsd(tiers[tier])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
        <span>
          {t('次の更新まで', 'Next update in')} {countdown}s
        </span>
        {lastRefresh && (
          <span>
            {t('更新:', 'Updated:')} {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* キャストボタン */}
      <button
        onClick={handleCast}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700
                   rounded-xl font-semibold text-sm transition"
      >
        📢 {t('Farcasterにキャストする', 'Cast to Farcaster')}
      </button>
    </div>
  )
}
