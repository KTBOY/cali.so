import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

import { Scoreline, SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../../_components/ui'
import { getAllYears, getTeams, getTournament } from '../../_lib/data'
import { isZhLocale, stageName, teamName } from '../../_lib/i18n'
import { matchHref, playerHref, teamHref } from '../../_lib/nav'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllYears().map((year) => ({ year: String(year) }))
}

function load(yearParam: string) {
  const year = Number(yearParam)
  if (!getAllYears().includes(year)) return null
  return getTournament(year)
}

export async function generateMetadata({
  params,
}: {
  params: { year: string }
}): Promise<Metadata> {
  const t = load(params.year)
  const tw = await getTranslations('worldCup')
  if (!t) return { title: `${tw('notFound')} · ${tw('title')}` }
  const locale = await getLocale()
  const isZh = isZhLocale(locale)
  const champion = t.standings.find((s) => s.position === 1)
  const title = `${tw('detail.metaTitle', { year: t.year })} · ${tw('title')}`
  const description = tw('detail.metaDescription', {
    year: t.year,
    hosts: t.hosts.map((h) => teamName(h, locale)).join(isZh ? '、' : ', '),
    champion: champion ? teamName(champion, locale) : '—',
    teams: t.teams,
    matches: t.matchesCount,
    goals: t.goalsCount,
  })
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
  const td = useTranslations('worldCup.detail')
  const locale = useLocale()
  const isZh = isZhLocale(locale)
  const t = load(params.year)
  if (!t) notFound()

  const champion = t.standings.find((s) => s.position === 1)
  // 射手榜与奖项里的 team 只有中文名,英文界面用映射还原
  const teamEnByZh = new Map(getTeams().map((tm) => [tm.nameZh, tm.nameEn]))
  const localTeam = (zh: string) => (isZh ? zh : teamEnByZh.get(zh) ?? zh)

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
            {td('fifaWorldCup')}
          </span>
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="text-neutral-400">{td('hostedBy')}</span>
          {t.hosts.map((h) => (
            <TeamChip key={h.teamId} team={h} />
          ))}
          {t.hostWon ? (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
              {td('hostWon')}
            </span>
          ) : null}
          {champion ? (
            <>
              <span className="ml-2 text-neutral-400">{td('champion')}</span>
              <TeamChip team={champion} href={teamHref(champion.slug)} />
            </>
          ) : null}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={td('statTeams')} value={t.teams} />
          <Stat label={td('statMatches')} value={t.matchesCount} />
          <Stat label={td('statGoals')} value={t.goalsCount} />
          <Stat
            label={td('statGpm')}
            value={t.matchesCount ? (t.goalsCount / t.matchesCount).toFixed(2) : '—'}
          />
        </StatGrid>
      </div>

      {/* 最终排名 */}
      {t.standings.length > 0 ? (
        <>
          <SectionHeading note={td('standingsNote')}>{td('standings')}</SectionHeading>
          <ul className="space-y-1.5">
            {t.standings.map((s) => (
              <li key={s.teamId} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 text-xs text-neutral-400">
                  {s.position <= 4
                    ? td(`pos${s.position}`)
                    : td('posOther', { position: s.position })}
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
          <SectionHeading note={td('topScorersNote')}>{td('topScorers')}</SectionHeading>
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
                <span className="text-xs text-neutral-400">{localTeam(p.team)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* 小组赛积分 */}
      {t.groups.length > 0 ? (
        <>
          <SectionHeading note={td('groupStageNote')}>{td('groupStage')}</SectionHeading>
          <div className="space-y-6">
            {t.groups.map((g) => (
              <div key={g.group}>
                <div className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {g.group}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] text-neutral-400 dark:border-neutral-800">
                      <th className="py-1 text-left font-normal">{td('thTeam')}</th>
                      <th className="py-1 text-right font-normal">{td('thW')}</th>
                      <th className="py-1 text-right font-normal">{td('thD')}</th>
                      <th className="py-1 text-right font-normal">{td('thL')}</th>
                      <th className="py-1 text-right font-normal">{td('thGd')}</th>
                      <th className="py-1 text-right font-normal">{td('thPts')}</th>
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
      <SectionHeading note={td('scheduleNote', { count: t.matchesCount })}>
        {td('schedule')}
      </SectionHeading>
      <div className="space-y-6">
        {t.matchesByStage.map((sg) => (
          <div key={sg.stage}>
            <div className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {stageName(sg.stageZh, locale)}
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
                      ? td('penalties', { score: m.penalties })
                      : m.extraTime
                        ? td('extraTime')
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
          <SectionHeading>{td('awards')}</SectionHeading>
          <ul className="space-y-1.5 text-sm">
            {t.awards.map((a, i) => (
              <li key={`${a.award}-${i}`} className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 text-xs text-neutral-400">{a.award}</span>
                <span className="text-neutral-900 dark:text-neutral-100">{a.name}</span>
                <span className="text-xs text-neutral-400">{localTeam(a.team)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* 球场 */}
      {t.stadiums.length > 0 ? (
        <>
          <SectionHeading note={td('venuesNote', { count: t.stadiums.length })}>
            {td('venues')}
          </SectionHeading>
          <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
            {t.stadiums.join(' · ')}
          </p>
        </>
      ) : null}
    </WcShell>
  )
}
