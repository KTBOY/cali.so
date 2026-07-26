'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { wallpaperGroups } from '~/config/wallpaper'

/** 全部子分类总数（面板标题展示） */
const totalCategoryCount = wallpaperGroups.reduce(
  (sum, g) => sum + g.items.length,
  0
)

/** 横向滚动栏：隐藏滚动条 + 两侧渐隐遮罩（纯 CSS，无 JS 监听） */
const scrollBarClass =
  'flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]'

/** 每次滚动加载的张数 */
const PAGE_SIZE = 12
/** 骨架屏占位高度（循环取用，营造瀑布流错落感） */
const SKELETON_HEIGHTS = [200, 260, 320, 240]

/** 生成 4 位验证码（排除易混淆字符） */
function genCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

/** 把验证码绘制到 canvas（含干扰线与噪点） */
function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#fdf2f4'
  ctx.fillRect(0, 0, width, height)

  // 干扰线
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `hsla(${Math.random() * 360}, 60%, 70%, .5)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }
  // 噪点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `hsla(${Math.random() * 360}, 60%, 60%, .4)`
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }
  // 字符
  const step = width / (code.length + 1)
  code.split('').forEach((ch, i) => {
    ctx.save()
    ctx.font = `bold ${22 + Math.random() * 6}px sans-serif`
    ctx.fillStyle = `hsl(${340 + Math.random() * 60}, 45%, ${40 + Math.random() * 15}%)`
    ctx.translate(step * (i + 1), height / 2)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })
}

/** 触发浏览器下载（经服务端代理，附带 Content-Disposition） */
function triggerDownload(url: string) {
  const a = document.createElement('a')
  a.href = `/api/wallpaper/download?url=${encodeURIComponent(url)}`
  a.download = ''
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/* ============================ 验证码弹窗 ============================ */
function CaptchaDialog({
  onClose,
  onPass,
}: {
  onClose: () => void
  onPass: () => void
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [code, setCode] = React.useState(genCaptchaCode)
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (canvasRef.current) drawCaptcha(canvasRef.current, code)
  }, [code])

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function refresh() {
    setCode(genCaptchaCode())
    setValue('')
    setError(false)
  }

  function submit() {
    if (value.trim().toUpperCase() === code) {
      onPass()
    } else {
      setError(true)
      refresh()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-xs rounded-3xl border border-black/[0.06] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          下载验证
        </h3>
        <p className="mt-1 text-xs font-light text-zinc-400">
          输入下方验证码即可保存壁纸
        </p>

        <div className="mt-4 flex items-center gap-3">
          <canvas
            ref={canvasRef}
            width={140}
            height={44}
            className="cursor-pointer rounded-xl border border-black/[0.06] dark:border-white/10"
            title="看不清？点击换一张"
            onClick={refresh}
          />
          <button
            type="button"
            className="text-xs font-light text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:hover:text-zinc-200"
            onClick={refresh}
          >
            换一张
          </button>
        </div>

        <motion.input
          ref={inputRef}
          value={value}
          maxLength={4}
          placeholder="请输入验证码"
          className={`mt-4 w-full rounded-xl border bg-zinc-50 px-4 py-2.5 text-sm uppercase tracking-[0.3em] text-zinc-800 outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-400 focus:border-rose-300 dark:bg-zinc-800 dark:text-zinc-100 ${
            error
              ? 'border-rose-400'
              : 'border-black/[0.08] dark:border-white/10'
          }`}
          animate={error ? { x: [0, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.35 }}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        {error && (
          <p className="mt-2 text-xs text-rose-500">验证码不正确，请重试</p>
        )}

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            className="flex-1 rounded-xl border border-black/[0.08] py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:border-white/10 dark:hover:text-zinc-200"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-zinc-700 hover:shadow-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            onClick={submit}
          >
            确认下载
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ============================ 大图查看器 ============================ */
function Lightbox({
  pics,
  index,
  onClose,
  onNavigate,
  onDownload,
}: {
  pics: string[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
  onDownload: (url: string) => void
}) {
  const [loaded, setLoaded] = React.useState(false)
  const url = pics[index]

  // 键盘操作：Esc 关闭，左右方向键切换
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && index < pics.length - 1)
        onNavigate(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, pics.length, onClose, onNavigate])

  // 锁定页面滚动
  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  React.useEffect(() => setLoaded(false), [index])

  if (!url) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* 加载指示 */}
      {!loaded && (
        <span className="absolute h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      )}

      <motion.img
        key={url}
        src={url}
        alt={`壁纸大图 ${index + 1}`}
        className="max-h-[86vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.96 }}
        transition={{ duration: 0.3 }}
        onLoad={() => setLoaded(true)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* 关闭按钮 */}
      <button
        type="button"
        aria-label="关闭大图"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:rotate-90 hover:bg-white/25"
        onClick={onClose}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* 上一张 / 下一张 */}
      {index > 0 && (
        <button
          type="button"
          aria-label="上一张"
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white/25 sm:left-6"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index - 1)
          }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      )}
      {index < pics.length - 1 && (
        <button
          type="button"
          aria-label="下一张"
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white/25 sm:right-6"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index + 1)
          }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      )}

      {/* 底部信息条 */}
      <div
        className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-light tracking-widest text-zinc-200 backdrop-blur">
          {index + 1} / {pics.length}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-lg"
          onClick={() => onDownload(url)}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          保存壁纸
        </button>
      </div>
    </motion.div>
  )
}

/* ============================ 单张壁纸卡片 ============================ */
const WallpaperCard = React.memo(function WallpaperCard({
  url,
  index,
  onView,
  onDownload,
}: {
  url: string
  index: number
  onView: () => void
  onDownload: () => void
}) {
  const [loaded, setLoaded] = React.useState(false)
  const skeletonHeight = SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length]

  return (
    <motion.div
      className="group relative mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-1.5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] dark:border-white/[0.06] dark:bg-white/[0.03]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % PAGE_SIZE) * 0.03 }}
    >
      {/* 骨架屏：图片加载完成前占位 */}
      {!loaded && (
        <div
          className="w-full animate-pulse rounded-[1.25rem] bg-zinc-100 dark:bg-zinc-800"
          style={{ height: skeletonHeight }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`壁纸 No.${index + 1}`}
        loading="lazy"
        decoding="async"
        className={`w-full cursor-zoom-in rounded-[1.25rem] object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
          loaded ? 'block' : 'hidden'
        }`}
        onLoad={() => setLoaded(true)}
        onClick={onView}
      />

      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[11px] font-light tracking-[0.2em] text-zinc-400">
          No.{String(index + 1).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-rose-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
          onClick={onDownload}
        >
          保存
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  )
})

/* ============================ 全部分类面板 ============================ */
function CategoryPanel({
  activeId,
  onClose,
  onSelect,
}: {
  activeId: string
  onClose: () => void
  onSelect: (groupIndex: number, id: string) => void
}) {
  const [query, setQuery] = React.useState('')

  // 搜索过滤（187 项纯字符串匹配，开销极小；保留原分组索引便于选中后回填）
  // 注意：不可用 useDeferredValue，会导致 AnimatePresence 退出动画后无法卸载
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return wallpaperGroups
      .map((g, gi) => ({
        name: g.name,
        groupIndex: gi,
        items: q
          ? g.items.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
            )
          : g.items,
      }))
      .filter((g) => g.items.length > 0)
  }, [query])

  // Esc 关闭 + 锁定页面滚动
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-black/[0.06] bg-white shadow-2xl sm:rounded-3xl dark:border-white/10 dark:bg-zinc-900"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部：标题 + 搜索 */}
        <div className="border-b border-black/[0.05] p-5 dark:border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              全部分类
              <span className="ml-2 text-xs font-light text-zinc-400">
                {totalCategoryCount} 个
              </span>
            </h3>
            <button
              type="button"
              aria-label="关闭分类面板"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
              onClick={onClose}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="relative mt-3">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              value={query}
              placeholder="搜索分类，如：原神、雷姆…"
              className="w-full rounded-xl border border-black/[0.08] bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-rose-300 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm font-light text-zinc-400">
              没有找到相关分类
            </p>
          )}
          {filtered.map((g) => (
            <div key={g.name} className="mb-5 last:mb-0">
              <p className="mb-2.5 text-xs font-medium tracking-[0.2em] text-zinc-400">
                {g.name}
                <span className="ml-1.5 font-light">{g.items.length}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      activeId === c.id
                        ? 'rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                        : 'rounded-full border border-black/[0.06] bg-white px-3.5 py-1.5 text-xs font-light text-zinc-500 transition-colors hover:border-rose-200 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-rose-300'
                    }
                    onClick={() => onSelect(g.groupIndex, c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ============================ 壁纸墙主组件 ============================ */
export function WallpaperWall() {
  const [groupIndex, setGroupIndex] = React.useState(0)
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [category, setCategory] = React.useState('img1')
  const [pics, setPics] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [viewIndex, setViewIndex] = React.useState<number | null>(null)
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null)

  const loadingRef = React.useRef(false)
  const seenRef = React.useRef<Set<string>>(new Set())
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  /** 拉取一批壁纸（append=false 为重置） */
  const fetchPics = React.useCallback(
    async (id: string, append: boolean) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      setFailed(false)
      try {
        const res = await fetch(`/api/wallpaper?id=${id}&num=${PAGE_SIZE}`)
        if (!res.ok) throw new Error('bad response')
        const data = (await res.json()) as { pics?: string[] }
        // 随机接口可能返回重复图，用 Set 去重
        const fresh = (data.pics ?? []).filter(
          (url) => !seenRef.current.has(url)
        )
        fresh.forEach((url) => seenRef.current.add(url))
        setPics((prev) => (append ? [...prev, ...fresh] : fresh))
      } catch {
        setFailed(true)
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    },
    []
  )

  /** 切换分类 / 换一批：清空后重新加载 */
  const reset = React.useCallback(
    (id: string) => {
      seenRef.current = new Set()
      setPics([])
      setViewIndex(null)
      void fetchPics(id, false)
    },
    [fetchPics]
  )

  React.useEffect(() => {
    reset(category)
  }, [category, reset])

  // 无限滚动：哨兵进入视口即加载下一批
  // 依赖 pics.length：每批加载完成后重新观察，若哨兵仍在视口内会立即再触发一次
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          void fetchPics(category, true)
        }
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [category, fetchPics, pics.length])

  const subItems = wallpaperGroups[groupIndex]?.items ?? []

  /** 切换大分组：自动选中该组第一个子分类 */
  function switchGroup(index: number) {
    setGroupIndex(index)
    const first = wallpaperGroups[index]?.items[0]
    if (first && first.id !== category) {
      setCategory(first.id)
    }
  }

  /** 从全部分类面板选中 */
  function selectFromPanel(gi: number, id: string) {
    setGroupIndex(gi)
    setPanelOpen(false)
    if (id !== category) {
      setCategory(id)
    }
  }

  // 选中的子分类自动滚入视野（仅横向，block: nearest 避免页面跳动）
  const subBarRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    subBarRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [category])

  return (
    <div className="mt-12">
      {/* 大分组：横向滑动胶囊栏（主流频道栏交互，超出即滑动） */}
      <div className={scrollBarClass}>
        {wallpaperGroups.map((g, gi) => (
          <button
            key={g.name}
            type="button"
            className={
              gi === groupIndex
                ? 'flex-none whitespace-nowrap rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium text-white shadow-sm transition dark:bg-zinc-100 dark:text-zinc-900'
                : 'flex-none whitespace-nowrap rounded-full border border-black/[0.06] bg-white/80 px-5 py-2 text-sm font-light text-zinc-500 shadow-sm transition hover:text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:hover:text-zinc-200'
            }
            onClick={() => switchGroup(gi)}
          >
            {g.name}
            <span className="ml-1.5 text-[10px] font-light opacity-60">
              {g.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* 子分类：横向滑动 + 右侧固定「全部分类」入口 */}
      <div className="mt-3 flex items-center gap-2">
        <div ref={subBarRef} className={`min-w-0 flex-1 ${scrollBarClass}`}>
          {subItems.map((c) => (
            <button
              key={c.id}
              type="button"
              data-active={category === c.id}
              className={
                category === c.id
                  ? 'flex-none whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-600 transition dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                  : 'flex-none whitespace-nowrap rounded-full border border-black/[0.06] bg-white/60 px-3.5 py-1.5 text-xs font-light text-zinc-500 transition hover:border-rose-200 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-rose-300'
              }
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex flex-none items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-500 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-rose-300"
          onClick={() => setPanelOpen(true)}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
          全部分类
        </button>
      </div>

      {/* 状态与操作行 */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-xs font-light tracking-widest text-zinc-400">
          已加载 {pics.length} 枚 · 滚动取更多
        </span>
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-5 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
          onClick={() => reset(category)}
        >
          <svg
            className="h-4 w-4 text-rose-400 transition-transform duration-500 group-hover:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          换一批
        </button>
      </div>

      {/* 瀑布流 */}
      <div className="mt-8 columns-2 gap-5 sm:columns-3 lg:columns-4">
        {pics.map((url, i) => (
          <WallpaperCard
            key={url}
            url={url}
            index={i}
            onView={() => setViewIndex(i)}
            onDownload={() => setPendingUrl(url)}
          />
        ))}
        {/* 首屏骨架屏 */}
        {loading &&
          pics.length === 0 &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-1.5 dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              <div
                className="w-full animate-pulse rounded-[1.25rem] bg-zinc-100 dark:bg-zinc-800"
                style={{
                  height: SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length],
                }}
              />
              <div className="px-3 py-3">
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
      </div>

      {/* 加载失败提示 */}
      {failed && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-light text-zinc-400">
            壁纸加载失败，可能是图源暂时不可用
          </p>
          <button
            type="button"
            className="rounded-full border border-black/[0.08] px-5 py-2 text-sm font-medium text-zinc-600 transition hover:shadow-md dark:border-white/10 dark:text-zinc-300"
            onClick={() => void fetchPics(category, pics.length > 0)}
          >
            点击重试
          </button>
        </div>
      )}

      {/* 无限滚动哨兵 + 加载指示 */}
      <div ref={sentinelRef} className="mt-6 flex justify-center py-6">
        {loading && pics.length > 0 && (
          <span className="inline-flex items-center gap-2.5 text-xs font-light tracking-widest text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-400 dark:border-zinc-700" />
            正在拾取新壁纸…
          </span>
        )}
      </div>

      <p className="mt-2 text-center text-xs font-light tracking-widest text-zinc-400">
        图片来源 · MoeHu 随机图片 API
      </p>

      {/* 大图查看器 */}
      <AnimatePresence>
        {viewIndex !== null && (
          <Lightbox
            pics={pics}
            index={viewIndex}
            onClose={() => setViewIndex(null)}
            onNavigate={setViewIndex}
            onDownload={(url) => setPendingUrl(url)}
          />
        )}
      </AnimatePresence>

      {/* 下载验证码弹窗 */}
      <AnimatePresence>
        {pendingUrl !== null && (
          <CaptchaDialog
            onClose={() => setPendingUrl(null)}
            onPass={() => {
              triggerDownload(pendingUrl)
              setPendingUrl(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* 全部分类面板 */}
      <AnimatePresence>
        {panelOpen && (
          <CategoryPanel
            activeId={category}
            onClose={() => setPanelOpen(false)}
            onSelect={selectFromPanel}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
