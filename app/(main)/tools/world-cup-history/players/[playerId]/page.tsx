import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../../_components/ui'
import { getAllPlayerIds, getPlayer } from '../../_lib/data'
import { teamHref } from '../../_lib/nav'
import { type PlayerDetail } from '../../_lib/types'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPlayerIds().map((playerId) => ({ playerId }))
}

function load(id: string): PlayerDetail | null {
  try {
    return getPlayer(id)
  } catch {
    return null
  }
}

export function generateMetadata({
  params,
}: {
  params: { playerId: string }
}): Metadata {
  const p = load(params.playerId)
  if (!p) return { title: '未找到 · 世界杯历史' }
  const title = `${p.name} · 世界杯历史`
  const description = `${p.name}的世界杯数据:${p.goals} 粒进球、${p.appearances} 次出场。`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function PlayerPage({
  params,
}: {
  params: { playerId: string }
}) {
  const p = load(params.playerId)
  if (!p) notFound()
  const years = Object.keys(p.goalsByYear)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          PLAYER{p.position ? ` · ${p.position}` : ''}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-neutral-900 dark:text-neutral-100">
          {p.name}
        </h1>
        {p.birthDate ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            出生 {p.birthDate}
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="世界杯进球" value={p.goals} />
          <Stat label="出场 (1970+)" value={p.appearances} />
          <Stat label="参赛届数" value={p.tournaments.length} />
          <Stat label="个人奖项" value={p.awards.length} />
        </StatGrid>
      </div>

      {p.teams.length > 0 ? (
        <>
          <SectionHeading>代表球队</SectionHeading>
          <div className="flex flex-wrap gap-3">
            {p.teams.map((t) => (
              <TeamChip key={t.teamId} team={t} href={teamHref(t.slug)} />
            ))}
          </div>
        </>
      ) : null}

      {years.length > 0 ? (
        <>
          <SectionHeading note="各届进球">进球分布</SectionHeading>
          <ul className="space-y-1.5">
            {years.map((y) => {
              const n = p.goalsByYear[String(y)] ?? 0
              return (
                <li key={y} className="flex items-center gap-3 text-sm">
                  <span className="w-14 shrink-0 font-serif text-base tabular-nums text-neutral-900 dark:text-neutral-100">
                    {y}
                  </span>
                  <span className="tracking-tight text-orange-700 dark:text-orange-500">
                    {'●'.repeat(n)}
                  </span>
                  <span className="text-xs text-neutral-400">{n} 球</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      {p.awards.length > 0 ? (
        <>
          <SectionHeading>个人奖项</SectionHeading>
          <ul className="space-y-1.5 text-sm">
            {p.awards.map((a, i) => (
              <li key={`${a.year}-${i}`} className="flex items-baseline gap-3">
                <span className="w-14 shrink-0 font-serif tabular-nums text-neutral-900 dark:text-neutral-100">
                  {a.year}
                </span>
                <span className="text-neutral-600 dark:text-neutral-300">
                  {a.award}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionHeading note="参赛年份">出场记录</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-500 dark:text-neutral-400">
        {p.tournaments.length > 0 ? p.tournaments.join(' · ') : '—'}
      </p>
    </WcShell>
  )
}
