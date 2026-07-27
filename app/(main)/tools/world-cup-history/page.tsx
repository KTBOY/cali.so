import { type Metadata } from 'next'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import React from 'react'

import { DataBar, Scoreline, SectionHeading, Stat, StatGrid, TeamChip, WcShell } from './_components/ui'
import { getMeta, getTournamentsIndex } from './_lib/data'
import { stageName, teamName } from './_lib/i18n'
import { WC_BASE } from './_lib/nav'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = t('title')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function WorldCupHomePage() {
  const t = useTranslations('worldCup.home')
  const tWc = useTranslations('worldCup')
  const locale = useLocale()
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
          {tWc('title')}
        </h1>
        <p className="mt-5 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('heroIntro')}
        </p>
      </header>

      {/* 关键数据 */}
      <div className="mt-8">
        <StatGrid>
          <Stat label={t('statTournaments')} value={meta.totals.tournaments} />
          <Stat label={t('statMatches')} value={meta.totals.matches} />
          <Stat label={t('statGoals')} value={meta.totals.goals} />
          <Stat label={t('statTeams')} value={meta.totals.teams} />
        </StatGrid>
      </div>

      {/* 最悬殊比分 */}
      <SectionHeading note={t('biggestMarginNote')}>
        {t('biggestMargin')}
      </SectionHeading>
      <div>
        {meta.biggestMargin.map((m) => (
          <Scoreline
            key={m.matchId}
            home={m.home}
            away={m.away}
            href={`${WC_BASE}/tournaments/${m.year}`}
            meta={t('marginMeta', {
              year: m.year,
              stage: stageName(m.stageZh, locale),
              margin: m.margin,
            })}
          />
        ))}
      </div>

      {/* 单场进球最多 */}
      <SectionHeading note={t('mostGoalsNote')}>{t('mostGoals')}</SectionHeading>
      <div>
        {meta.mostGoals.map((m) => (
          <Scoreline
            key={m.matchId}
            home={m.home}
            away={m.away}
            href={`${WC_BASE}/tournaments/${m.year}`}
            meta={t('totalMeta', {
              year: m.year,
              stage: stageName(m.stageZh, locale),
              total: m.total,
            })}
          />
        ))}
      </div>

      {/* 夺冠次数 */}
      <SectionHeading note={t('championsNote')}>{t('champions')}</SectionHeading>
      <div className="space-y-2.5">
        {meta.mostTitles.map((tt) => (
          <DataBar
            key={tt.teamId}
            label={teamName(tt, locale)}
            value={tt.titles}
            max={maxTitles}
            suffix={t('timesSuffix')}
          />
        ))}
      </div>

      {/* 22 届网格 */}
      <SectionHeading note={t('editionsCount', { count: meta.totals.tournaments })}>
        {t('allTournaments')}
      </SectionHeading>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {tournaments.map((tn) => (
          <Link
            key={tn.year}
            href={`${WC_BASE}/tournaments/${tn.year}`}
            className="group rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <div className="font-serif text-2xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
              {tn.year}
            </div>
            <div className="mt-2 text-[11px] text-neutral-400">
              {t('champion')}
            </div>
            {tn.winner ? (
              <div className="mt-0.5">
                <TeamChip team={tn.winner} />
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
