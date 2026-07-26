import { type Metadata } from 'next'

import { WallpaperWall } from '~/app/(main)/bz/WallpaperWall'
import { Container } from '~/components/ui/Container'

const title = '壁纸中心'
const description =
  '一处安静的壁纸收纳所。把喜欢的二次元与动漫壁纸，收拢在同一片留白之中。'

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
  },
} satisfies Metadata

export default function WallpaperPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      {/* ============ 日系风格头图 · 和纸留白 ============ */}
      <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-gradient-to-b from-sky-50/80 via-rose-50/40 to-white shadow-[0_20px_60px_-32px_rgba(0,0,0,0.25)] dark:border-white/[0.06] dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900">
        {/* 柔光晕染 */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/10" />

        <div className="relative px-6 py-16 sm:px-14 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-zinc-500 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400/80" />
            壁纸箱 · WALLPAPER
          </span>

          <h1 className="mt-7 text-4xl font-semibold tracking-tight text-zinc-800 sm:text-6xl dark:text-zinc-100">
            壁纸中心
          </h1>
          <p className="mt-3 text-sm font-light tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
            きせかえの小部屋
          </p>

          <p className="mt-8 max-w-xl text-base font-light leading-loose text-zinc-500 dark:text-zinc-400">
            一处安静的壁纸收纳所。<br className="hidden sm:block" />
            把喜欢的二次元与动漫壁纸，收拢在同一片留白之中，
            <br className="hidden sm:block" />
            向下滚动，每一页都是新的邂逅。
          </p>
        </div>
      </div>

      {/* ============ 壁纸墙 ============ */}
      <WallpaperWall />
    </Container>
  )
}
