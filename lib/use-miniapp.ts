'use client'

import { useEffect, useRef, useState } from 'react'

type MiniAppUser = {
  fid: number
  username?: string
  displayName?: string
}

type MiniAppState = {
  isChecking: boolean
  isInMiniApp: boolean
  user: MiniAppUser | null
}

export function useMiniApp() {
  const [state, setState] = useState<MiniAppState>({
    isChecking: true,
    isInMiniApp: false,
    user: null,
  })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    let isMounted = true

    async function init() {
      try {
        const { sdk } = await import('@farcaster/miniapp-sdk')
        const isInMiniApp = await sdk.isInMiniApp()

        if (!isMounted) return

        if (!isInMiniApp) {
          setState({
            isChecking: false,
            isInMiniApp: false,
            user: null,
          })
          return
        }

        try {
          await sdk.actions.ready()
        } catch {
          // Ignore readiness failures in unsupported environments.
        }

        let user: MiniAppUser | null = null

        try {
          const context = await sdk.context
          if (context?.user) {
            user = {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
            }
          }
        } catch {
          // Context is optional for browser fallback support.
        }

        if (isMounted) {
          setState({
            isChecking: false,
            isInMiniApp: true,
            user,
          })
        }
      } catch {
        if (isMounted) {
          setState({
            isChecking: false,
            isInMiniApp: false,
            user: null,
          })
        }
      }
    }

    void init()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
