import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { TournamentsList } from '../_components/TournamentsList'
import { SectionHeading, WcShell } from '../_components/ui'
import { getMeta, getTeams, getTournamentsIndex } from '../_lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('tournaments.title')} · ${t('title')}`
  const description = t('tournaments.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function TournamentsPage() {
  const t = useTranslations('worldCup.tournaments')
  const tournaments = getTournamentsIndex()
  const meta = getMeta()
  // TournamentIndexItem.hosts 只有中文名,从 teams.json 补英文名映射
  const hostNameEn = Object.fromEntries(
    getTeams().map((tm) => [tm.code, tm.nameEn])
  )

  return (
    <WcShell>
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          TOURNAMENTS
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro', { count: meta.totals.tournaments })}
        </p>
      </header>

      <SectionHeading note={t('totalNote', { count: tournaments.length })}>
        {t('all')}
      </SectionHeading>
      <TournamentsList tournaments={tournaments} hostNameEn={hostNameEn} />
    </WcShell>
  )
}
