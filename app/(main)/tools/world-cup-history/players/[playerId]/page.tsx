import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../../_components/ui'
import { getAllPlayerIds, getPlayer } from '../../_lib/data'
import { posName } from '../../_lib/i18n'
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

export async function generateMetadata({
  params,
}: {
  params: { playerId: string }
}): Promise<Metadata> {
  const p = load(params.playerId)
  const tw = await getTranslations('worldCup')
  if (!p) return { title: `${tw('notFound')} · ${tw('title')}` }
  const title = `${p.name} · ${tw('title')}`
  const description = tw('player.metaDescription', {
    name: p.name,
    goals: p.goals,
    appearances: p.appearances,
  })
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
  const t = useTranslations('worldCup.player')
  const locale = useLocale()
  const p = load(params.playerId)
  if (!p) notFound()
  const years = Object.keys(p.goalsByYear)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          PLAYER{p.position ? ` · ${posName(p.position, locale)}` : ''}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-normal text-neutral-900 dark:text-neutral-100">
          {p.name}
        </h1>
        {p.birthDate ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {t('born', { date: p.birthDate })}
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={t('statGoals')} value={p.goals} />
          <Stat label={t('statApps')} value={p.appearances} />
          <Stat label={t('statTournaments')} value={p.tournaments.length} />
          <Stat label={t('statAwards')} value={p.awards.length} />
        </StatGrid>
      </div>

      {p.teams.length > 0 ? (
        <>
          <SectionHeading>{t('playedFor')}</SectionHeading>
          <div className="flex flex-wrap gap-3">
            {p.teams.map((tm) => (
              <TeamChip key={tm.teamId} team={tm} href={teamHref(tm.slug)} />
            ))}
          </div>
        </>
      ) : null}

      {years.length > 0 ? (
        <>
          <SectionHeading note={t('goalsByYearNote')}>{t('goalsByYear')}</SectionHeading>
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
                  <span className="text-xs text-neutral-400">
                    {t('goalsShort', { count: n })}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      {p.awards.length > 0 ? (
        <>
          <SectionHeading>{t('awards')}</SectionHeading>
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

      <SectionHeading note={t('appearancesNote')}>{t('appearances')}</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-500 dark:text-neutral-400">
        {p.tournaments.length > 0 ? p.tournaments.join(' · ') : '—'}
      </p>
    </WcShell>
  )
}
