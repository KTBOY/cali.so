import { type Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { DataBar, Scoreline, SectionHeading, Stat, StatGrid, TeamChip, WcShell } from './_components/ui'
import { getMeta, getTournamentsIndex } from './_lib/data'
import { WC_BASE } from './_lib/nav'

const title = '世界杯历史'
const description =
  '男足 FIFA 世界杯历史数据库（1930–2022）：22 届赛事、964 场比赛、2720 粒进球的编辑型档案。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function WorldCupHomePage() {
  const meta = getMeta()
  const tournaments = getTournamentsIndex()
  const maxTitles = meta.mostTitles[0]?.titles ?? 1

  return (
    <WcShell>
      {/* Hero */}
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          FIFA WORLD CUP · 1930–2022
        </p>
        <h1 className="mt-3 font-serif text-5xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          世界杯历史
        </h1>
        <p className="mt-5 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          一座关于男足世界杯的安静档案馆。自 1930 年乌拉圭至 2022
          年卡塔尔，22 届赛事的每一场比赛、每一粒进球、每一次夺冠，
          都以数据的方式被收拢在这里——不喧哗，只陈列。
        </p>
      </header>

      {/* 关键数据 */}
      <div className="mt-8">
        <StatGrid>
          <Stat label="届" value={meta.totals.tournaments} />
          <Stat label="场比赛" value={meta.totals.matches} />
          <Stat label="粒进球" value={meta.totals.goals} />
          <Stat label="支参赛队" value={meta.totals.teams} />
        </StatGrid>
      </div>

      {/* 最悬殊比分 */}
      <SectionHeading note="按净胜球">最悬殊的比分</SectionHeading>
      <div>
        {meta.biggestMargin.map((m) => (
          <Scoreline
            key={m.matchId}
            home={m.home}
            away={m.away}
            href={`${WC_BASE}/tournaments/${m.year}`}
            meta={
              <>
                {m.year} · {m.stageZh} · 净胜 {m.margin} 球
              </>
            }
          />
        ))}
      </div>

      {/* 单场进球最多 */}
      <SectionHeading note="主客双方合计">单场进球最多</SectionHeading>
      <div>
        {meta.mostGoals.map((m) => (
          <Scoreline
            key={m.matchId}
            home={m.home}
            away={m.away}
            href={`${WC_BASE}/tournaments/${m.year}`}
            meta={
              <>
                {m.year} · {m.stageZh} · 合计 {m.total} 球
              </>
            }
          />
        ))}
      </div>

      {/* 夺冠次数 */}
      <SectionHeading note="历届冠军">谁举起过大力神杯</SectionHeading>
      <div className="space-y-2.5">
        {meta.mostTitles.map((t) => (
          <DataBar
            key={t.teamId}
            label={t.nameZh}
            value={t.titles}
            max={maxTitles}
            suffix=" 次"
          />
        ))}
      </div>

      {/* 22 届网格 */}
      <SectionHeading note={`${meta.totals.tournaments} 届`}>
        历届一览
      </SectionHeading>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {tournaments.map((t) => (
          <Link
            key={t.year}
            href={`${WC_BASE}/tournaments/${t.year}`}
            className="group rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <div className="font-serif text-2xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
              {t.year}
            </div>
            <div className="mt-2 text-[11px] text-neutral-400">冠军</div>
            {t.winner ? (
              <div className="mt-0.5">
                <TeamChip team={t.winner} />
              </div>
            ) : (
              <div className="mt-0.5 text-sm text-neutral-400">—</div>
            )}
          </Link>
        ))}
      </div>
    </WcShell>
  )
}
