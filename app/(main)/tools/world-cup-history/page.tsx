import { type Metadata } from 'next'
import Link from 'next/link'

import { WorldCupHistory } from '~/app/(main)/tools/world-cup-history/WorldCupHistory'
import { Container } from '~/components/ui/Container'

const title = '世界杯历史 · 工具库'
const description =
  '历届 FIFA 世界杯决赛档案馆：以官方转播风格呈现每一届冠军之战的首发阵容、比分进球与球员评分。'

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

export default function WorldCupHistoryPage() {
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
        <span className="text-zinc-600 dark:text-zinc-300">世界杯历史</span>
      </nav>

      {/* 页面标题 · FIFA 官方风格头图 */}
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-14 shadow-2xl sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 64px)',
          }}
        />

        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-sky-300/80">
            <span className="text-base">🏆</span>
            WORLD CUP FINALS ARCHIVE
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            世界杯历史
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-loose text-white/60">
            重温历届 FIFA 世界杯决赛的巅峰对决。选择年份，即可查看两支球队的
            <b className="font-medium text-white/90"> 首发阵型</b>、
            <b className="font-medium text-white/90"> 比分进球</b> 与
            <b className="font-medium text-white/90"> 球员评分</b>。
          </p>
          <p className="mt-3 text-xs font-light text-white/35">
            比分、进球与首发阵容为历史事实；球员评分为编辑综合评分（满分 10），仅供参考。
          </p>
        </div>
      </header>

      {/* 工具主体 */}
      <div className="mt-10">
        <WorldCupHistory />
      </div>
    </Container>
  )
}
