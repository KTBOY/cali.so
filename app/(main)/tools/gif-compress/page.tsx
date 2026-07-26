import { type Metadata } from 'next'
import Link from 'next/link'

import { GifCompressor } from '~/app/(main)/tools/gif-compress/GifCompressor'
import { Container } from '~/components/ui/Container'

const title = 'GIF 压缩 · 工具库'
const description =
  '在浏览器里压缩 GIF 动图：自动逐级尝试「缩放 + 抽帧 + 调色板量化（带抖动）」组合，取第一个满足目标体积且质量最高的方案。文件不上传服务器，全程本地完成。'

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

export default function GifCompressPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      {/* 面包屑 */}
      <nav className="mb-8 flex items-center gap-2 text-sm font-light text-zinc-400">
        <Link
          href="/tools"
          className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          工具库
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-zinc-600 dark:text-zinc-300">GIF 压缩</span>
      </nav>

      {/* 页面标题 · 日系留白 */}
      <header className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-gradient-to-b from-emerald-50/80 via-lime-50/30 to-white px-6 py-14 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.25)] sm:px-12 sm:py-16 dark:border-white/[0.06] dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />

        <div className="relative">
          <p className="text-[11px] font-light tracking-[0.3em] text-emerald-600 dark:text-emerald-300">
            GIF圧縮
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            GIF 压缩
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-loose text-zinc-500 dark:text-zinc-400">
            上传一个 <b className="font-medium text-zinc-700 dark:text-zinc-200">.gif</b>{' '}
            动图，自动逐级尝试
            <b className="font-medium text-zinc-700 dark:text-zinc-200">
              「缩放 + 抽帧 + 调色板量化」
            </b>
            组合，取第一个满足目标体积且质量最高的方案，播放总时长保持不变。整个过程在你的浏览器里本地完成，
            <b className="font-medium text-zinc-700 dark:text-zinc-200">
              文件不会上传到任何服务器
            </b>
            。
          </p>
        </div>
      </header>

      {/* 工具主体 */}
      <div className="mt-10">
        <GifCompressor />
      </div>
    </Container>
  )
}
