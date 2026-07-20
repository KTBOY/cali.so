import { type Metadata } from 'next'
import Link from 'next/link'

import { SwfToExe } from '~/app/(main)/tools/swf-to-exe/SwfToExe'
import { Container } from '~/components/ui/Container'

const title = 'SWF 转 EXE · 工具库'
const description =
  '在浏览器里把 Flash 动画 / 游戏（.swf）打包成可独立运行的 Windows 播放器（.exe）。文件不上传服务器，全程本地完成。'

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

export default function SwfToExePage() {
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
        <span className="text-zinc-600 dark:text-zinc-300">SWF 转 EXE</span>
      </nav>

      {/* 页面标题 · 日系留白 */}
      <header className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-gradient-to-b from-rose-50/80 via-orange-50/30 to-white px-6 py-14 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.25)] sm:px-12 sm:py-16 dark:border-white/[0.06] dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />

        <div className="relative">
          <p className="text-[11px] font-light tracking-[0.3em] text-rose-500 dark:text-rose-300">
            フラッシュ変換
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            SWF 转 EXE
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-loose text-zinc-500 dark:text-zinc-400">
            上传一个 <b className="font-medium text-zinc-700 dark:text-zinc-200">.swf</b>{' '}
            文件，将它与 Flash 独立播放器打包成一个可以双击运行的{' '}
            <b className="font-medium text-zinc-700 dark:text-zinc-200">.exe</b>{' '}
            程序。整个过程在你的浏览器里本地完成，
            <b className="font-medium text-zinc-700 dark:text-zinc-200">文件不会上传到任何服务器</b>。
          </p>
        </div>
      </header>

      {/* 工具主体 */}
      <div className="mt-10">
        <SwfToExe />
      </div>
    </Container>
  )
}
