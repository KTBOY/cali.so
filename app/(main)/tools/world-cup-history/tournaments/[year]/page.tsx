import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Scoreline, SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../../_components/ui'
import { getAllYears, getTournament } from '../../_lib/data'
import { matchHref, playerHref, teamHref } from '../../_lib/nav'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllYears().map((year) => ({ year: String(year) }))
}

const POSITION_ZH: Record<number, string> = { 1: '冠军', 2: '亚军', 3: '季军', 4: '殿军' }

function load(yearParam: string) {
  const year = Number(yearParam)
  if (!getAllYears().includes(year)) return null
  return getTournament(year)
}

export function generateMetadata({
  params,
}: {
  params: { year: string }
}): Metadata {
  const t = load(params.year)
  if (!t) return { title: '未找到 · 世界杯历史' }
  const champion = t.standings.find((s) => s.position === 1)?.nameZh ?? ''
  const title = `${t.year} 年世界杯 · 世界杯历史`
  const description = `${t.year} 年 FIFA 世界杯：主办 ${t.hosts
    .map((h) => h.nameZh)
    .join('、')}，冠军 ${champion}，${t.teams} 队 / ${t.matchesCount} 场 / ${t.goalsCount} 球。`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function TournamentDetailPage({
  params,
}: {
  params: { year: string }
}) {
  const t = load(params.year)
  if (!t) notFound()

  const champion = t.standings.find((s) => s.position === 1)

  return (
    <WcShell>
      {/* Hero */}
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          {t.startDate} — {t.endDate}
        </p>
        <h1 className="mt-2 flex items-baseline gap-3">
          <span className="font-serif text-6xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
            {t.year}
          </span>
          <span className="text-lg font-normal text-neutral-500 dark:text-neutral-400">
            FIFA 世界杯
          </span>
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="text-neutral-400">主办</span>
          {t.hosts.map((h) => (
            <TeamChip key={h.teamId} team={h} />
          ))}
          {t.hostWon ? (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              东道主夺冠
            </span>
          ) : null}
          {champion ? (
            <>
              <span className="ml-2 text-neutral-400">冠军</span>
              <TeamChip team={champion} href={teamHref(champion.slug)} />
            </>
          ) : null}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="参赛队" value={t.teams} />
          <Stat label="场比赛" value={t.matchesCount} />
          <Stat label="粒进球" value={t.goalsCount} />
          <Stat
            label="场均进球"
            value={t.matchesCount ? (t.goalsCount / t.matchesCount).toFixed(2) : '—'}
          />
        </StatGrid>
      </div>

      {/* 最终排名 */}
      {t.standings.length > 0 ? (
        <>
          <SectionHeading note="前四名">最终排名</SectionHeading>
          <ul className="space-y-1.5">
            {t.standings.map((s) => (
              <li key={s.teamId} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 text-xs text-neutral-400">
                  {POSITION_ZH[s.position] ?? `第 ${s.position}`}
                </span>
                <TeamChip team={s} href={teamHref(s.slug)} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* 射手榜 */}
      {t.topScorers.length > 0 ? (
        <>
          <SectionHeading note="进球数">射手榜</SectionHeading>
          <ul className="space-y-1.5">
            {t.topScorers.map((p) => (
              <li key={p.playerId} className="flex items-baseline gap-3 text-sm">
                <span className="w-8 shrink-0 text-right font-serif text-lg tabular-nums text-orange-700 dark:text-orange-500">
                  {p.goals}
                </span>
                <Link
                  href={playerHref(p.playerId)}
                  className="text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100"
                >
                  {p.name}
                </Link>
                <span className="text-xs text-neutral-400">{p.team}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* 小组赛积分 */}
      {t.groups.length > 0 ? (
        <>
          <SectionHeading note="最终积分">小组赛</SectionHeading>
          <div className="space-y-6">
            {t.groups.map((g) => (
              <div key={g.group}>
                <div className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {g.group}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] text-neutral-400 dark:border-neutral-800">
                      <th className="py-1 text-left font-normal">球队</th>
                      <th className="py-1 text-right font-normal">胜</th>
                      <th className="py-1 text-right font-normal">平</th>
                      <th className="py-1 text-right font-normal">负</th>
                      <th className="py-1 text-right font-normal">净</th>
                      <th className="py-1 text-right font-normal">分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r) => (
                      <tr
                        key={r.teamId}
                        className="border-b border-neutral-100 dark:border-neutral-800/60"
                      >
                        <td className="py-1.5">
                          <span className="flex items-center gap-2">
                            <span
                              className={
                                r.advanced
                                  ? 'text-neutral-900 dark:text-neutral-100'
                                  : 'text-neutral-400'
                              }
                            >
                              <TeamChip team={r} href={teamHref(r.slug)} />
                            </span>
                          </span>
                        </td>
                        <td className="py-1.5 text-right tabular-nums text-neutral-500">{r.wins}</td>
                        <td className="py-1.5 text-right tabular-nums text-neutral-500">{r.draws}</td>
                        <td className="py-1.5 text-right tabular-nums text-neutral-500">{r.losses}</td>
                        <td className="py-1.5 text-right tabular-nums text-neutral-500">
                          {r.gd > 0 ? `+${r.gd}` : r.gd}
                        </td>
                        <td className="py-1.5 text-right font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          {r.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* 赛程（按阶段） */}
      <SectionHeading note={`${t.matchesCount} 场`}>完整赛程</SectionHeading>
      <div className="space-y-6">
        {t.matchesByStage.map((sg) => (
          <div key={sg.stage}>
            <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {sg.stageZh}
            </div>
            <div>
              {sg.matches.map((m) => (
                <Scoreline
                  key={m.matchId}
                  home={m.home}
                  away={m.away}
                  score={m.score}
                  href={matchHref(m.matchId)}
                  meta={
                    m.penalties
                      ? `点球 ${m.penalties}`
                      : m.extraTime
                        ? '加时赛'
                        : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 个人奖项 */}
      {t.awards.length > 0 ? (
        <>
          <SectionHeading>个人奖项</SectionHeading>
          <ul className="space-y-1.5 text-sm">
            {t.awards.map((a, i) => (
              <li key={`${a.award}-${i}`} className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 text-xs text-neutral-400">{a.award}</span>
                <span className="text-neutral-900 dark:text-neutral-100">{a.name}</span>
                <span className="text-xs text-neutral-400">{a.team}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* 球场 */}
      {t.stadiums.length > 0 ? (
        <>
          <SectionHeading note={`${t.stadiums.length} 座`}>比赛球场</SectionHeading>
          <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
            {t.stadiums.join(' · ')}
          </p>
        </>
      ) : null}
    </WcShell>
  )
}
