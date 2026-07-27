import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

import {
  DataBar,
  GoalDistribution,
  SectionHeading,
  Stat,
  StatGrid,
  WcShell,
} from '../../_components/ui'
import { getAllTeamSlugs, getTeam } from '../../_lib/data'
import { perfName, teamName } from '../../_lib/i18n'
import { playerHref, tournamentHref } from '../../_lib/nav'
import { type TeamDetail } from '../../_lib/types'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllTeamSlugs().map((slug) => ({ slug }))
}

function load(slug: string): TeamDetail | null {
  try {
    return getTeam(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const t = load(params.slug)
  const tw = await getTranslations('worldCup')
  if (!t) return { title: `${tw('notFound')} · ${tw('title')}` }
  const locale = await getLocale()
  const name = teamName(t, locale)
  const title = `${name} · ${tw('title')}`
  const description = tw('team.metaDescription', {
    name,
    appearances: t.appearances,
    matches: t.matches,
    titles: t.titles,
  })
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function TeamPage({ params }: { params: { slug: string } }) {
  const tt = useTranslations('worldCup.team')
  const locale = useLocale()
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
            {teamName(t, locale)}
          </span>
          <span className="font-mono text-sm text-neutral-400">{t.code}</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {tt('appearancesLine', {
            first: t.firstYear,
            last: t.lastYear,
            count: t.appearances,
          })}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={tt('statAppearances')} value={t.appearances} />
          <Stat label={tt('statMatches')} value={t.matches} />
          <Stat label={tt('statWins')} value={t.wins} />
          <Stat label={tt('statTitles')} value={t.titles} />
        </StatGrid>
      </div>

      <SectionHeading note={tt('recordNote')}>{tt('record')}</SectionHeading>
      <div className="space-y-2.5">
        <DataBar
          label={tt('win')}
          value={t.wins}
          max={wldMax}
          tone="strong"
          suffix={tt('matchesSuffix')}
        />
        <DataBar
          label={tt('draw')}
          value={t.draws}
          max={wldMax}
          tone="weak"
          suffix={tt('matchesSuffix')}
        />
        <DataBar
          label={tt('loss')}
          value={t.losses}
          max={wldMax}
          tone="weak"
          suffix={tt('matchesSuffix')}
        />
      </div>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        {tt('summary', {
          gf: t.gf,
          ga: t.ga,
          best:
            t.bestFinish === 1
              ? tt('bestChampion')
              : t.bestFinish
                ? tt('bestNth', { n: t.bestFinish })
                : '—',
        })}
      </p>

      <SectionHeading note={tt('goalTimingNote')}>{tt('goalTiming')}</SectionHeading>
      <GoalDistribution dist={t.goalDistribution} />

      {t.topScorers.length > 0 ? (
        <>
          <SectionHeading note={tt('scorersNote')}>{tt('scorers')}</SectionHeading>
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

      <SectionHeading note={tt('byTournamentNote', { count: t.byTournament.length })}>
        {tt('byTournament')}
      </SectionHeading>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-[11px] text-neutral-400 dark:border-neutral-800">
            <th className="py-1 text-left font-normal">{tt('thYear')}</th>
            <th className="py-1 text-left font-normal">{tt('thResult')}</th>
            <th className="py-1 text-right font-normal">{tt('thPlayed')}</th>
            <th className="py-1 text-right font-normal">{tt('thWdl')}</th>
            <th className="py-1 text-right font-normal">{tt('thGfGa')}</th>
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
                {perfName(r.performance, locale)}
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
