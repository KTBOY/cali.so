import { type Metadata } from 'next'

import { GameCenter } from '~/app/(main)/game-center/GameCenter'
import { Container } from '~/components/ui/Container'

const title = '游戏中心'
const description =
  '在线畅玩经典 Flash 游戏！基于 Ruffle 模拟器，无需安装 Flash Player 即可在浏览器中运行 SWF 游戏。'

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

export default function GameCenterPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      {/* 街机舞台 —— 暗色霓虹背景 */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 px-6 py-14 shadow-2xl sm:px-10 sm:py-20">
        {/* 网格背景 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          }}
        />
        {/* 顶部霓虹光晕 */}
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 animate-float rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 animate-float rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:1.5s]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <header className="relative mx-auto max-w-2xl text-center">
          {/* 徽章 */}
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-300 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-glow-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.8)]" />
            ARCADE · 街机厅
          </span>

          <h1 className="mt-6 bg-gradient-to-r from-emerald-300 via-cyan-300 to-fuchsia-300 bg-[length:200%_auto] bg-clip-text text-4xl font-black tracking-tight text-transparent animate-gradient-x sm:text-6xl">
            游戏中心
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
            在线畅玩经典 <b className="text-emerald-300">Flash</b> 游戏！基于{' '}
            <b className="text-cyan-300">Ruffle</b> 模拟器，无需安装 Flash
            Player 即可在浏览器中运行 SWF 游戏。选择下方游戏开始游玩吧。
          </p>
        </header>

        {/* 游戏内容区 */}
        <div className="relative mt-14">
          <GameCenter />
        </div>
      </div>
    </Container>
  )
}
