import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  DataBar,
  GoalDistribution,
  SectionHeading,
  Stat,
  StatGrid,
  WcShell,
} from '../../_components/ui'
import { getAllTeamSlugs, getTeam } from '../../_lib/data'
import { playerHref, tournamentHref } from '../../_lib/nav'
import { type TeamDetail } from '../../_lib/types'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllTeamSlugs().map((slug) => ({ slug }))
}

const PERF_ZH: Record<string, string> = {
  final: '决赛',
  'third-place match': '季军战',
  'third place match': '季军战',
  'semi-finals': '半决赛',
  'quarter-finals': '八强',
  'round of 16': '16 强',
  'round of sixteen': '16 强',
  'group stage': '小组赛',
  'second group stage': '复赛小组',
  'final round': '决赛圈',
  'first round': '第一轮',
  'second round': '第二轮',
}

function load(slug: string): TeamDetail | null {
  try {
    return getTeam(slug)
  } catch {
    return null
  }
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const t = load(params.slug)
  if (!t) return { title: '未找到 · 世界杯历史' }
  const title = `${t.nameZh} · 世界杯历史`
  const description = `${t.nameZh}的世界杯档案:${t.appearances} 次参赛、${t.matches} 场比赛、${t.titles} 次夺冠。`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function TeamPage({ params }: { params: { slug: string } }) {
  const t = load(params.slug)
  if (!t) notFound()
  const wldMax = Math.max(t.wins, t.draws, t.losses, 1)

  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          {t.confederation}
          {t.region ? ` · ${t.region}` : ''}
        </p>
        <h1 className="mt-2 flex items-baseline gap-3">
          <span className="font-serif text-5xl font-normal text-neutral-900 dark:text-neutral-100">
            {t.nameZh}
          </span>
          <span className="font-mono text-sm text-neutral-400">{t.code}</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {t.firstYear}–{t.lastYear} · 共 {t.appearances} 次参赛
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="次参赛" value={t.appearances} />
          <Stat label="场比赛" value={t.matches} />
          <Stat label="胜" value={t.wins} />
          <Stat label="次夺冠" value={t.titles} />
        </StatGrid>
      </div>

      <SectionHeading note="全部赛事">战绩</SectionHeading>
      <div className="space-y-2.5">
        <DataBar label="胜" value={t.wins} max={wldMax} tone="strong" suffix=" 场" />
        <DataBar label="平" value={t.draws} max={wldMax} tone="weak" suffix=" 场" />
        <DataBar label="负" value={t.losses} max={wldMax} tone="weak" suffix=" 场" />
      </div>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        进 {t.gf} 球 · 失 {t.ga} 球 · 最佳成绩{' '}
        {t.bestFinish === 1
          ? '冠军'
          : t.bestFinish
            ? `第 ${t.bestFinish} 名`
            : '—'}
      </p>

      <SectionHeading note="进球时段分布">什么时候进球</SectionHeading>
      <GoalDistribution dist={t.goalDistribution} />

      {t.topScorers.length > 0 ? (
        <>
          <SectionHeading note="队史射手">谁在进球</SectionHeading>
          <ul className="space-y-1.5">
            {t.topScorers.map((s) => (
              <li key={s.playerId} className="flex items-baseline gap-3 text-sm">
                <span className="w-8 shrink-0 text-right font-serif text-lg tabular-nums text-orange-700 dark:text-orange-500">
                  {s.goals}
                </span>
                <Link
                  href={playerHref(s.playerId)}
                  className="text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100 dark:hover:text-orange-500"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionHeading note={`${t.byTournament.length} 届`}>历届战绩</SectionHeading>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-[11px] text-neutral-400 dark:border-neutral-800">
            <th className="py-1 text-left font-normal">年份</th>
            <th className="py-1 text-left font-normal">成绩</th>
            <th className="py-1 text-right font-normal">场</th>
            <th className="py-1 text-right font-normal">胜平负</th>
            <th className="py-1 text-right font-normal">进/失</th>
          </tr>
        </thead>
        <tbody>
          {t.byTournament.map((r) => (
            <tr
              key={r.year}
              className="border-b border-neutral-100 dark:border-neutral-800/60"
            >
              <td className="py-1.5">
                <Link
                  href={tournamentHref(r.year)}
                  className="font-serif text-base tabular-nums text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100"
                >
                  {r.year}
                </Link>
              </td>
              <td className="py-1.5 text-neutral-500 dark:text-neutral-400">
                {PERF_ZH[r.performance] ?? r.performance}
              </td>
              <td className="py-1.5 text-right tabular-nums text-neutral-500">
                {r.played}
              </td>
              <td className="py-1.5 text-right tabular-nums text-neutral-500">
                {r.wins}-{r.draws}-{r.losses}
              </td>
              <td className="py-1.5 text-right tabular-nums text-neutral-500">
                {r.gf}/{r.ga}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WcShell>
  )
}
