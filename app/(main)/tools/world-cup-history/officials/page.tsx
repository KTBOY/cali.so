import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, WcShell } from '../_components/ui'
import { getOfficials } from '../_lib/data'
import { type OfficialPerson } from '../_lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('officials.title')} · ${t('title')}`
  const description = t('officials.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

function PeopleList({ people }: { people: OfficialPerson[] }) {
  const t = useTranslations('worldCup.officials')
  return (
    <ul className="mt-4">
      {people.map((p, i) => (
        <li
          key={`${p.name}-${i}`}
          className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-2.5 text-sm dark:border-neutral-800/60"
        >
          <span className="w-6 shrink-0 text-right font-serif tabular-nums text-neutral-400">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-neutral-900 dark:text-neutral-100">
            {p.name}
            <span className="ml-2 text-xs text-neutral-400">{p.country}</span>
          </span>
          <span className="shrink-0 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
            {t('personMeta', { matches: p.matches, tournaments: p.tournaments })}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function OfficialsPage() {
  const t = useTranslations('worldCup.officials')
  const { managers, referees } = getOfficials()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          MANAGERS &amp; REFEREES
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro', { managers: managers.total, referees: referees.total })}
        </p>
      </header>

      <SectionHeading note={t('managersNote')}>{t('managers')}</SectionHeading>
      <PeopleList people={managers.top} />

      <SectionHeading note={t('refereesNote')}>{t('referees')}</SectionHeading>
      <PeopleList people={referees.top} />
    </WcShell>
  )
}
