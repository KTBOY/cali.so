'use client'

import React, { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    RufflePlayer?: {
      config?: Record<string, unknown>
      newest?: () => {
        createPlayer: (container: HTMLElement) => RufflePlayerElement
      }
    }
  }
}

interface RufflePlayerInstance {
  load: (options: { url: string }) => Promise<void>
  remove: () => void
  isPlaying: boolean
  play: () => void
  pause: () => void
}

// createPlayer 返回的实际上是自定义元素本身
type RufflePlayerElement = RufflePlayerInstance & HTMLElement

interface RufflePlayerProps {
  swfUrl: string
  title?: string
}

const RUFFLE_CDN = 'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle/ruffle.js'

// 模块级单例：确保 Ruffle 脚本只加载一次
let ruffleScriptPromise: Promise<void> | null = null

// 抑制 Ruffle polyfill 扫描跨域 iframe 产生的无害警告
let warnPatched = false
function patchConsoleWarn() {
  if (warnPatched || typeof window === 'undefined') return
  warnPatched = true
  const originalWarn = console.warn.bind(console)
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (
      msg.includes("Couldn't load Ruffle into IFRAME") ||
      msg.includes('disconnected or suspended Ruffle element')
    ) {
      return
    }
    originalWarn(...args)
  }
}

function loadRuffleScript(): Promise<void> {
  if (ruffleScriptPromise) return ruffleScriptPromise

  ruffleScriptPromise = new Promise<void>((resolve, reject) => {
    if (window.RufflePlayer?.newest) {
      resolve()
      return
    }

    const existingScript = document.querySelector(`script[src="${RUFFLE_CDN}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Ruffle'))
      )
      return
    }

    // 在脚本加载前配置：禁用 polyfill 自动扫描
    window.RufflePlayer = {
      config: {
        polyfills: [],
        autostart: false,
      },
    }

    const script = document.createElement('script')
    script.src = RUFFLE_CDN
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Ruffle script'))
    document.head.appendChild(script)
  })

  return ruffleScriptPromise
}

export default function RufflePlayer({
  swfUrl,
  title = 'SWF Game',
}: RufflePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<RufflePlayerElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    patchConsoleWarn()

    let cancelled = false
    // 使用延迟初始化：StrictMode 双重挂载时，第一次 effect 的 timer
    // 会在 cleanup 时被清除，只有第二次 effect 的 timer 会真正执行
    let timer: ReturnType<typeof setTimeout> | null = null

    const init = async () => {
      const container = containerRef.current
      if (!container) return

      try {
        await loadRuffleScript()
        if (cancelled || !containerRef.current) return

        if (!window.RufflePlayer?.newest) {
          throw new Error('Ruffle 初始化失败')
        }

        // 清理可能存在的旧播放器
        if (playerRef.current) {
          try {
            playerRef.current.remove()
          } catch {
            /* noop */
          }
          playerRef.current = null
        }
        container.innerHTML = ''

        // 创建播放器
        const ruffle = window.RufflePlayer.newest()
        const player = ruffle.createPlayer(container)
        playerRef.current = player

        // 此版本 Ruffle createPlayer 不会自动 append，需手动添加到容器
        if (!player.isConnected) {
          container.appendChild(player)
        }

        // 设置播放器尺寸
        const el = player
        el.style.width = '100%'
        el.style.height = '100%'

        // 等待元素完全连接到 DOM
        await new Promise<void>((r) => requestAnimationFrame(() => r()))
        if (cancelled) return

        // 最终安全检查：确保元素已连接
        if (!el.isConnected) {
          return // 元素未连接，静默退出（cleanup 已执行）
        }

        await player.load({ url: encodeURI(swfUrl) })
        if (cancelled) return

        // 验证加载后元素仍在 DOM 中（load 可能静默失败）
        if (el.isConnected) {
          setStatus('playing')
        }
      } catch (err) {
        if (cancelled) return
        console.error('Ruffle player error:', err)
        setErrorMsg(err instanceof Error ? err.message : '游戏加载失败')
        setStatus('error')
      }
    }

    setStatus('loading')
    // 延迟 150ms 初始化，避免 StrictMode 竞态
    timer = setTimeout(init, 150)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      if (playerRef.current) {
        try {
          playerRef.current.remove()
        } catch {
          /* noop */
        }
        playerRef.current = null
      }
    }
  }, [swfUrl, retryKey])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      {/* 游戏容器 */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      />

      {/* 加载状态 */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/90">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-zinc-300">正在加载 {title}...</p>
        </div>
      )}

      {/* 错误状态 */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/90 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-center text-sm text-zinc-300">{errorMsg}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            重新加载
          </button>
        </div>
      )}
    </div>
  )
}
