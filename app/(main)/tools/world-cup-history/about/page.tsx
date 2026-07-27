import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, Stat, StatGrid, WcShell } from '../_components/ui'
import { getMeta } from '../_lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('about.title')} · ${t('title')}`
  const description = t('about.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function AboutPage() {
  const t = useTranslations('worldCup.about')
  const tHome = useTranslations('worldCup.home')
  const meta = getMeta()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">ABOUT</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('heading')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro')}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={tHome('statTournaments')} value={meta.totals.tournaments} />
          <Stat label={tHome('statMatches')} value={meta.totals.matches} />
          <Stat label={tHome('statGoals')} value={meta.totals.goals} />
          <Stat label={t('statTeams')} value={meta.totals.teams} />
        </StatGrid>
      </div>

      <SectionHeading>{t('sources')}</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
        {t.rich('sourcesRich', {
          db: (chunks) => (
            <a
              href="https://github.com/jfjelstul/worldcup"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline underline-offset-2 dark:text-blue-500"
            >
              {chunks}
            </a>
          ),
          cc: (chunks) => (
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline underline-offset-2 dark:text-blue-500"
            >
              {chunks}
            </a>
          ),
        })}
      </p>

      <SectionHeading>{t('methodology')}</SectionHeading>
      <ul className="space-y-2 text-sm font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
        <li>{t('method1')}</li>
        <li>{t('method2')}</li>
        <li>{t('method3')}</li>
        <li>{t('method4')}</li>
        <li>{t('method5')}</li>
      </ul>

      <SectionHeading>{t('names')}</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
        {t('namesText')}
      </p>
    </WcShell>
  )
}
