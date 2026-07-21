import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MatchTimeline } from '../../_components/MatchTimeline'
import { SectionHeading, TeamChip, WcShell } from '../../_components/ui'
import { getAllMatchIds, getMatch } from '../../_lib/data'
import { playerHref, teamHref, tournamentHref } from '../../_lib/nav'
import { type MatchDetail } from '../../_lib/types'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllMatchIds().map((matchId) => ({ matchId }))
}

function load(id: string): MatchDetail | null {
  try {
    return getMatch(id)
  } catch {
    return null
  }
}

export function generateMetadata({
  params,
}: {
  params: { matchId: string }
}): Metadata {
  const m = load(params.matchId)
  if (!m) return { title: '未找到 · 世界杯历史' }
  const title = `${m.home.nameZh} ${m.home.score ?? ''}–${m.away.score ?? ''} ${m.away.nameZh} · ${m.year} 世界杯`
  const description = `${m.year} 年世界杯 ${m.stageZh}:${m.home.nameZh} 对阵 ${m.away.nameZh}。`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

const SIDES = ['home', 'away'] as const

export default function MatchPage({
  params,
}: {
  params: { matchId: string }
}) {
  const m = load(params.matchId)
  if (!m) notFound()

  return (
    <WcShell>
      <nav className="mb-4 text-xs text-neutral-400">
        <Link
          href={tournamentHref(m.year)}
          className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          {m.year} 年世界杯
        </Link>
        <span className="mx-1">·</span>
        {m.stageZh}
        {m.group ? ` · ${m.group}` : ''}
      </nav>

      {/* 比分卡 */}
      <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-4">
          {SIDES.map((sd) => {
            const team = sd === 'home' ? m.home : m.away
            return (
              <Link
                key={sd}
                href={teamHref(team.slug)}
                className="flex-1 text-center transition-colors hover:text-orange-700"
              >
                <div className="font-mono text-xs text-neutral-400">{team.code}</div>
                <div className="mt-1 font-serif text-xl font-normal text-neutral-900 dark:text-neutral-100">
                  {team.nameZh}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <div className="font-serif text-4xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
            {m.home.score ?? '-'} – {m.away.score ?? '-'}
          </div>
          {m.penalties ? (
            <div className="mt-1 text-xs text-orange-700 dark:text-orange-500">
              点球 {m.penalties}
            </div>
          ) : m.extraTime ? (
            <div className="mt-1 text-xs text-neutral-400">加时赛</div>
          ) : null}
        </div>
        <p className="mt-4 text-center text-xs text-neutral-400">
          {m.date}
          {m.stadium ? ` · ${m.stadium}` : ''}
          {m.city ? `，${m.city}` : ''}
        </p>
      </div>

      <MatchTimeline
        goals={m.goals}
        bookings={m.bookings}
        subs={m.subs}
        extraTime={m.extraTime}
      />

      {m.goals.length > 0 ? (
        <>
          <SectionHeading note={`${m.goals.length} 球`}>进球</SectionHeading>
          <ul className="space-y-1.5 text-sm">
            {m.goals.map((g, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="w-10 shrink-0 text-right font-mono text-xs text-neutral-400">
                  {g.label}
                </span>
                <span className="w-9 shrink-0 font-mono text-[11px] text-neutral-400">
                  {g.side === 'home' ? m.home.code : m.away.code}
                </span>
                <Link
                  href={playerHref(g.playerId)}
                  className="text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100"
                >
                  {g.scorer}
                </Link>
                {g.penalty ? <span className="text-[11px] text-neutral-400">(点球)</span> : null}
                {g.own ? <span className="text-[11px] text-neutral-400">(乌龙)</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {m.hasLineups ? (
        <>
          <SectionHeading note="首发 + 替补">阵容</SectionHeading>
          <div className="grid grid-cols-2 gap-6">
            {SIDES.map((sd) => {
              const team = sd === 'home' ? m.home : m.away
              const lu = m.lineups[sd]
              return (
                <div key={sd}>
                  <div className="mb-2 text-xs font-medium">
                    <TeamChip team={team} />
                  </div>
                  <ol className="space-y-1 text-sm">
                    {lu.starters.map((pl, i) => (
                      <li key={i} className="flex items-baseline gap-2">
                        <span className="w-5 shrink-0 text-right font-mono text-[11px] text-neutral-400">
                          {pl.num ?? ''}
                        </span>
                        <span className="text-neutral-800 dark:text-neutral-200">{pl.name}</span>
                        <span className="text-[10px] text-neutral-400">{pl.pos}</span>
                      </li>
                    ))}
                  </ol>
                  {lu.subs.length > 0 ? (
                    <div className="mt-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                      <div className="mb-1 text-[10px] text-neutral-400">替补</div>
                      <ul className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {lu.subs.map((pl, i) => (
                          <li key={i} className="flex items-baseline gap-2">
                            <span className="w-5 shrink-0 text-right font-mono text-neutral-400">
                              {pl.num ?? ''}
                            </span>
                            {pl.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs font-light leading-relaxed text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
          FIFA 官方比赛报告自 1970 年起才收录首发阵容、换人与红黄牌;本场为早期赛事,仅保留进球记录。
        </p>
      )}

      {m.referee || m.managers.home || m.managers.away ? (
        <>
          <SectionHeading>其他</SectionHeading>
          <dl className="space-y-1.5 text-sm">
            {m.managers.home ? (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-xs text-neutral-400">主队主帅</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{m.managers.home}</dd>
              </div>
            ) : null}
            {m.managers.away ? (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-xs text-neutral-400">客队主帅</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{m.managers.away}</dd>
              </div>
            ) : null}
            {m.referee ? (
              <div className="flex gap-3">
                <dt className="w-16 shrink-0 text-xs text-neutral-400">主裁判</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {m.referee.name}
                  {m.referee.country ? ` (${m.referee.country})` : ''}
                </dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}
    </WcShell>
  )
}
