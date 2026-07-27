'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import { wallpaperGroups } from '~/config/wallpaper'

/** 全部子分类总数（面板标题展示） */
const totalCategoryCount = wallpaperGroups.reduce(
  (sum, g) => sum + g.items.length,
  0
)

/** 横向滚动栏：隐藏滚动条 + 两侧渐隐遮罩（负外边距抵消内边距，静止时首尾 tab 不被遮罩盖住） */
const scrollBarClass =
  '-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]'

/** 每次滚动加载的张数 */
const PAGE_SIZE = 12
/** 预留宽高比集合（高/宽，循环取用）：盒子高度加载前后一致 → 0 抖动（参考 sk-image-waterfall） */
const CARD_RATIOS = [0.72, 0.86, 1.0, 1.16, 1.3]
/** 卡片底栏（No. + 保存）折算的列高常量，仅用于最矮列分配的列高估算 */
const CARD_META_RATIO = 0.16

/* ---------- 图片懒加载：全部卡片共享一个 IntersectionObserver ---------- */
let lazyObserver: IntersectionObserver | null = null
const lazyCallbacks = new WeakMap<Element, () => void>()

/** 观察元素进入视口（提前 400px 预加载），返回清理函数 */
function observeLazy(el: Element, onVisible: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    onVisible()
    return
  }
  lazyObserver ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const cb = lazyCallbacks.get(entry.target)
        lazyCallbacks.delete(entry.target)
        lazyObserver?.unobserve(entry.target)
        cb?.()
      })
    },
    { rootMargin: '400px 0px' }
  )
  lazyCallbacks.set(el, onVisible)
  lazyObserver.observe(el)
  return () => {
    lazyCallbacks.delete(el)
    lazyObserver?.unobserve(el)
  }
}

/** 瀑布流列数：断点与骨架屏一致（<640 两列 / ≥640 三列 / ≥1024 四列） */
function useColumnCount() {
  const [count, setCount] = React.useState(2)
  React.useEffect(() => {
    const lg = window.matchMedia('(min-width: 1024px)')
    const sm = window.matchMedia('(min-width: 640px)')
    const update = () => setCount(lg.matches ? 4 : sm.matches ? 3 : 2)
    update()
    lg.addEventListener('change', update)
    sm.addEventListener('change', update)
    return () => {
      lg.removeEventListener('change', update)
      sm.removeEventListener('change', update)
    }
  }, [])
  return count
}

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
  const t = useTranslations('wallpaper')

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
          {t('captchaTitle')}
        </h3>
        <p className="mt-1 text-xs font-light text-zinc-400">
          {t('captchaDesc')}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <canvas
            ref={canvasRef}
            width={140}
            height={44}
            className="cursor-pointer rounded-xl border border-black/[0.06] dark:border-white/10"
            title={t('captchaRefreshTip')}
            onClick={refresh}
          />
          <button
            type="button"
            className="text-xs font-light text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-700 hover:underline dark:hover:text-zinc-200"
            onClick={refresh}
          >
            {t('captchaRefresh')}
          </button>
        </div>

        <motion.input
          ref={inputRef}
          value={value}
          maxLength={4}
          placeholder={t('captchaPlaceholder')}
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
          <p className="mt-2 text-xs text-rose-500">{t('captchaError')}</p>
        )}

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            className="flex-1 rounded-xl border border-black/[0.08] py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:border-white/10 dark:hover:text-zinc-200"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-zinc-700 hover:shadow-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            onClick={submit}
          >
            {t('confirmDownload')}
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
  const t = useTranslations('wallpaper')

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
        <span className="absolute h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-lime-400" />
      )}

      <motion.img
        key={url}
        src={url}
        alt={t('lightboxAlt', { index: index + 1 })}
        referrerPolicy="no-referrer"
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
        aria-label={t('closeLightbox')}
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
          aria-label={t('prev')}
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
          aria-label={t('next')}
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
          {t('saveWallpaper')}
        </button>
      </div>
    </motion.div>
  )
}

/* ============================ 单张壁纸卡片 ============================ */
const WallpaperCard = React.memo(function WallpaperCard({
  url,
  index,
  ratio,
  onView,
  onDownload,
}: {
  url: string
  index: number
  /** 预留宽高比（高/宽），盒子高度固定，图片 object-cover 裁切填充 */
  ratio: number
  onView: (index: number) => void
  onDownload: (url: string) => void
}) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>(
    'loading'
  )
  const t = useTranslations('wallpaper')

  // 进入视口前只渲染骨架，由共享 IntersectionObserver 触发真正加载
  React.useEffect(() => {
    const el = cardRef.current
    if (!el) return
    return observeLazy(el, () => setInView(true))
  }, [])

  return (
    <div
      ref={cardRef}
      className="group relative mb-5 overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-1.5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] dark:border-white/[0.06] dark:bg-white/[0.03]"
    >
      {/* 预留高度盒：aspect-ratio 在加载前后完全一致，列高永不跳变 */}
      <div
        className="relative w-full overflow-hidden rounded-[1.25rem]"
        style={{ aspectRatio: `1 / ${ratio}` }}
      >
        {/* 流光骨架屏：加载完成 / 失败后淡出 */}
        <div
          className={`wf-skeleton ${
            status === 'loading' ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {status === 'error' ? (
          // 加载失败兜底（防盗链 / 坏图），占位盒尺寸不变
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <span className="text-xs font-light text-zinc-400">
              {t('imageLoadFailed')}
            </span>
          </div>
        ) : (
          inView && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={url}
              alt={t('cardAlt', { index: index + 1 })}
              decoding="async"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.02] ${
                status === 'loaded' ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
              onClick={() => onView(index)}
            />
          )
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-[11px] font-light tracking-[0.2em] text-zinc-400">
          No.{String(index + 1).padStart(2, '0')}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-rose-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
          onClick={() => onDownload(url)}
        >
          {t('save')}
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
    </div>
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
  const t = useTranslations('wallpaper')
  const locale = useLocale()

  // 搜索过滤（187 项纯字符串匹配，开销极小；保留原分组索引便于选中后回填）
  // 注意：不可用 useDeferredValue，会导致 AnimatePresence 退出动画后无法卸载
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return wallpaperGroups
      .map((g, gi) => ({
        name: g.name,
        nameEn: g.nameEn,
        groupIndex: gi,
        items: q
          ? g.items.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.nameEn.toLowerCase().includes(q) ||
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
              {t('allCategories')}
              <span className="ml-2 text-xs font-light text-zinc-400">
                {t('categoryCount', { count: totalCategoryCount })}
              </span>
            </h3>
            <button
              type="button"
              aria-label={t('closePanel')}
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
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-xl border border-black/[0.08] bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-rose-300 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm font-light text-zinc-400">
              {t('noResults')}
            </p>
          )}
          {filtered.map((g) => (
            <div key={g.name} className="mb-5 last:mb-0">
              <p className="mb-2.5 text-xs font-medium tracking-[0.2em] text-zinc-400">
                {locale === 'zh' ? g.name : g.nameEn}
                <span className="ml-1.5 font-light">{g.items.length}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={
                      activeId === c.id
                        ? 'rounded-full border border-lime-300 bg-lime-50 px-3.5 py-1.5 text-xs font-medium text-lime-600 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300'
                        : 'rounded-full border border-black/[0.06] bg-white px-3.5 py-1.5 text-xs font-light text-zinc-500 transition-colors hover:border-lime-300 hover:text-lime-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-lime-300'
                    }
                    onClick={() => onSelect(g.groupIndex, c.id)}
                  >
                    {locale === 'zh' ? c.name : c.nameEn}
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
  const columnCount = useColumnCount()
  const t = useTranslations('wallpaper')
  const locale = useLocale()

  const loadingRef = React.useRef(false)
  const seenRef = React.useRef<Set<string>>(new Set())
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  /** 稳定回调：避免追加图片时旧卡片因 props 变化重渲染（React.memo 才真正生效） */
  const handleView = React.useCallback((i: number) => setViewIndex(i), [])
  const handleDownload = React.useCallback(
    (url: string) => setPendingUrl(url),
    []
  )

  /** JS 瀑布流：按预留比估算列高，每张分到当前最矮列（参考 sk-image-waterfall 的 _distribute）。
   *  ratio 由 index 确定、贪心结果确定，因此追加新图时旧卡片分列不变，永不跨列重排 */
  const columns = React.useMemo(() => {
    const cols: { url: string; index: number; ratio: number }[][] = Array.from(
      { length: columnCount },
      () => []
    )
    const heights = new Array<number>(columnCount).fill(0)
    pics.forEach((url, index) => {
      const ratio = CARD_RATIOS[index % CARD_RATIOS.length]
      let min = 0
      for (let i = 1; i < columnCount; i++) {
        if (heights[i] < heights[min]) min = i
      }
      cols[min].push({ url, index, ratio })
      heights[min] += ratio + CARD_META_RATIO
    })
    return cols
  }, [pics, columnCount])

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
      { rootMargin: '1200px 0px' }
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
                ? 'flex-none whitespace-nowrap rounded-full bg-lime-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition dark:bg-lime-400 dark:text-zinc-900'
                : 'flex-none whitespace-nowrap rounded-full border border-black/[0.06] bg-white/80 px-5 py-2 text-sm font-light text-zinc-500 shadow-sm transition hover:text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:hover:text-zinc-200'
            }
            onClick={() => switchGroup(gi)}
          >
            {locale === 'zh' ? g.name : g.nameEn}
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
                  ? 'flex-none whitespace-nowrap rounded-full border border-lime-300 bg-lime-50 px-3.5 py-1.5 text-xs font-medium text-lime-600 transition dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300'
                  : 'flex-none whitespace-nowrap rounded-full border border-black/[0.06] bg-white/60 px-3.5 py-1.5 text-xs font-light text-zinc-500 transition hover:border-lime-300 hover:text-lime-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:text-lime-300'
              }
              onClick={() => setCategory(c.id)}
            >
              {locale === 'zh' ? c.name : c.nameEn}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex flex-none items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:-translate-y-0.5 hover:border-lime-300 hover:text-lime-600 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-lime-300"
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
          {t('allCategories')}
        </button>
      </div>

      {/* 状态与操作行 */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-xs font-light tracking-widest text-zinc-400">
          {t('loadedCount', { count: pics.length })}
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
          {t('refreshBatch')}
        </button>
      </div>

      {/* 瀑布流：JS 列分发（新图仅追加列尾，避免 CSS columns 整墙重排导致的滚动卡顿） */}
      <div className="mt-8 flex items-start gap-5">
        {columns.map((col, ci) => (
          <div key={ci} className="min-w-0 flex-1">
            {col.map(({ url, index, ratio }) => (
              <WallpaperCard
                key={url}
                url={url}
                index={index}
                ratio={ratio}
                onView={handleView}
                onDownload={handleDownload}
              />
            ))}
            {/* 首屏骨架屏：与真实卡片同比例的流光占位 */}
            {loading &&
              pics.length === 0 &&
              Array.from({ length: Math.ceil(PAGE_SIZE / columnCount) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="mb-5 overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-1.5 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <div
                      className="relative w-full overflow-hidden rounded-[1.25rem]"
                      style={{
                        aspectRatio: `1 / ${
                          CARD_RATIOS[
                            (i * columnCount + ci) % CARD_RATIOS.length
                          ]
                        }`,
                      }}
                    >
                      <div className="wf-skeleton" />
                    </div>
                    <div className="px-3 py-3">
                      <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  </div>
                )
              )}
          </div>
        ))}
      </div>

      {/* 加载失败提示 */}
      {failed && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-light text-zinc-400">
            {t('loadFailed')}
          </p>
          <button
            type="button"
            className="rounded-full border border-black/[0.08] px-5 py-2 text-sm font-medium text-zinc-600 transition hover:shadow-md dark:border-white/10 dark:text-zinc-300"
            onClick={() => void fetchPics(category, pics.length > 0)}
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* 无限滚动哨兵 + 加载指示（固定高度，指示器出现时不抖动页脚） */}
      <div ref={sentinelRef} className="mt-6 flex h-16 items-center justify-center">
        {loading && pics.length > 0 && (
          <span className="inline-flex items-center gap-2.5 text-xs font-light tracking-widest text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-lime-600 dark:border-zinc-700 dark:border-t-lime-400" />
            {t('fetching')}
          </span>
        )}
      </div>

      <p className="mt-2 text-center text-xs font-light tracking-widest text-zinc-400">
        {t('imageSource')}
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
