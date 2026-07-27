import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { TeamsList } from '../_components/TeamsList'
import { SectionHeading, WcShell } from '../_components/ui'
import { getTeams } from '../_lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('teams.title')} · ${t('title')}`
  const description = t('teams.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function TeamsPage() {
  const t = useTranslations('worldCup.teams')
  const teams = getTeams()
  return (
    <WcShell>
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          TEAMS
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro', { count: teams.length })}
        </p>
      </header>
      <SectionHeading note={t('countNote', { count: teams.length })}>
        {t('all')}
      </SectionHeading>
      <TeamsList teams={teams} />
    </WcShell>
  )
}
