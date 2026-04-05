'use client'

import { useEffect, useState } from 'react'
import type { ChainGasData } from '@/lib/gas'
import { APP_NAME, DEFAULT_APP_URL } from '@/lib/app-config'
import { useMiniApp } from '@/lib/use-miniapp'

const REFRESH_INTERVAL = 30 * 1000

const TIER_LABELS = {
  slow: { en: 'Slow', ja: '低速' },
  average: { en: 'Average', ja: '標準' },
  fast: { en: 'Fast', ja: '高速' },
} as const

const TIER_COLORS = {
  slow: 'text-blue-400',
  average: 'text-green-400',
  fast: 'text-orange-400',
} as const

function formatGwei(value: number) {
  if (value === 0) return '--'
  if (value < 0.01) return value.toFixed(4)
  if (value < 1) return value.toFixed(3)
  return value.toFixed(2)
}

function formatUsd(value: number) {
  if (value === 0) return '--'
  if (value < 0.001) return '<$0.001'
  if (value < 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(3)}`
}

function buildShareText(data: ChainGasData[], tab: 'eth' | 'erc20') {
  const lines = data.map((entry) => {
    const usd =
      tab === 'eth'
        ? entry.usdPerTier.average
        : entry.erc20UsdPerTier.average

    return `${entry.emoji} ${entry.chain}: ${formatGwei(
      entry.gasTiers.average
    )} Gwei (${formatUsd(usd)})`
  })

  const type = tab === 'eth' ? 'ETH Transfer' : 'ERC-20 Transfer'
  return `L2 Gas Race | ${type}\n${lines.join('\n')}\n\n#L2GasRace #Base`
}

export default function GasRaceApp() {
  const [data, setData] = useState<ChainGasData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [tab, setTab] = useState<'eth' | 'erc20'>('eth')
  const [lang, setLang] = useState<'ja' | 'en'>('ja')
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const { isChecking, isInMiniApp, user } = useMiniApp()

  const t = (ja: string, en: string) => (lang === 'ja' ? ja : en)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/gas')
        const json = (await res.json()) as ChainGasData[]
        setData(json)
        setLastRefresh(new Date())
        setCountdown(30)
      } catch {
        // Keep the previous data on transient fetch failures.
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((current) => (current <= 1 ? 30 : current - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!shareFeedback) return

    const timeout = window.setTimeout(() => {
      setShareFeedback(null)
    }, 2500)

    return () => window.clearTimeout(timeout)
  }, [shareFeedback])

  async function handleShare() {
    if (!data.length) return

    const text = buildShareText(data, tab)
    const currentUrl =
      typeof window === 'undefined' ? DEFAULT_APP_URL : window.location.href

    if (isInMiniApp) {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        await sdk.actions.composeCast({
          text,
          embeds: [currentUrl],
        })
        setShareFeedback(
          t('Farcaster composer を開きました', 'Opened Farcaster composer')
        )
        return
      } catch {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          await sdk.actions.openUrl({
            url: `https://warpcast.com/~/compose?text=${encodeURIComponent(
              `${text}\n${currentUrl}`
            )}`,
          })
          setShareFeedback(
            t('Warpcast compose を開きました', 'Opened Warpcast compose')
          )
          return
        } catch {
          // Fall through to web sharing.
        }
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: APP_NAME,
          text,
          url: currentUrl,
        })
        setShareFeedback(t('共有シートを開きました', 'Opened share sheet'))
        return
      } catch {
        // Ignore cancel events and fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${currentUrl}`)
      setShareFeedback(
        t('共有テキストをコピーしました', 'Copied share text')
      )
    } catch {
      setShareFeedback(t('共有に失敗しました', 'Sharing failed'))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="mb-2 text-3xl font-semibold animate-pulse">L2</div>
          <div className="text-sm text-gray-400">
            {t('ガスデータを取得中...', 'Fetching gas data...')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-950 px-4 py-5 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">L2 Gas Race</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {t('リアルタイムガス比較', 'Real-time gas comparison')}
          </p>
        </div>
        <button
          onClick={() => setLang((current) => (current === 'ja' ? 'en' : 'ja'))}
          className="rounded-full bg-gray-800 px-2 py-1 text-xs transition hover:bg-gray-700"
        >
          {lang === 'ja' ? 'EN' : 'JA'}
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-gray-500">
              {t('モード', 'Mode')}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-100">
              {isChecking
                ? t('接続先を確認中...', 'Detecting host...')
                : isInMiniApp
                  ? t('Farcaster Mini App', 'Farcaster Mini App')
                  : t('Base Web App / Browser', 'Base Web App / Browser')}
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            {user?.username
              ? `@${user.username}`
              : isInMiniApp
                ? t('Farcaster で起動中', 'Running in Farcaster')
                : t('通常ブラウザで利用可能', 'Available in any browser')}
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(['eth', 'erc20'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
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

      <div className="mb-4 space-y-3">
        {data.map((chain) => {
          const tiers =
            tab === 'eth' ? chain.usdPerTier : chain.erc20UsdPerTier

          return (
            <div
              key={chain.chainId}
              className="rounded-xl border border-gray-800 bg-gray-900 p-4"
              style={{ borderLeftColor: chain.color, borderLeftWidth: 3 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{chain.emoji}</span>
                <span className="text-sm font-semibold">{chain.chain}</span>
                {chain.error && (
                  <span className="ml-auto text-xs text-red-400">
                    {t('取得失敗', 'Error')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'average', 'fast'] as const).map((tier) => (
                  <div key={tier} className="text-center">
                    <div className={`mb-1 text-xs font-medium ${TIER_COLORS[tier]}`}>
                      {t(TIER_LABELS[tier].ja, TIER_LABELS[tier].en)}
                    </div>
                    <div className="text-sm font-mono font-bold">
                      {formatGwei(chain.gasTiers[tier])}
                      <span className="text-xs font-normal text-gray-400">
                        {' '}
                        Gwei
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">
                      {formatUsd(tiers[tier])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
        <span>
          {t('次の更新まで', 'Next update in')} {countdown}s
        </span>
        {lastRefresh && (
          <span>
            {t('更新:', 'Updated:')} {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      <button
        onClick={() => void handleShare()}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold transition hover:bg-blue-500 active:bg-blue-700"
      >
        {isInMiniApp
          ? t('Farcaster でシェア', 'Share on Farcaster')
          : t('共有テキストを作成', 'Share or copy update')}
      </button>

      {shareFeedback && (
        <p className="mt-3 text-center text-xs text-gray-400">{shareFeedback}</p>
      )}
    </div>
  )
}
