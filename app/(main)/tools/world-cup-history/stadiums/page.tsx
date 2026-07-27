import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, Stat, StatGrid, WcShell } from '../_components/ui'
import { getStadiums } from '../_lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('stadiums.title')} · ${t('title')}`
  const description = t('stadiums.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function StadiumsPage() {
  const t = useTranslations('worldCup.stadiums')
  const { total, byCountry } = getStadiums()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">STADIUMS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro')}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={t('statStadiums')} value={total} />
          <Stat label={t('statCountries')} value={byCountry.length} />
        </StatGrid>
      </div>

      {byCountry.map((c) => (
        <div key={c.country}>
          <SectionHeading note={t('countNote', { count: c.count })}>
            {c.country}
          </SectionHeading>
          <ul>
            {c.stadiums.map((s, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2 text-sm dark:border-neutral-800/60"
              >
                <span className="min-w-0">
                  <span className="text-neutral-900 dark:text-neutral-100">{s.name}</span>{' '}
                  <span className="text-xs text-neutral-400">{s.city}</span>
                </span>
                <span className="shrink-0 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                  {t('matchesCount', { count: s.matches })} ·{' '}
                  {s.firstYear === s.lastYear
                    ? s.firstYear
                    : `${s.firstYear}–${s.lastYear}`}
                  {s.capacity
                    ? ` · ${t('capacity', { value: s.capacity.toLocaleString() })}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </WcShell>
  )
}
