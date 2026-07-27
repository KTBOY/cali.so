import { type Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { H2HExplorer } from '../_components/H2HExplorer'
import { SectionHeading, WcShell } from '../_components/ui'
import { getH2H, getTeams } from '../_lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('h2h.title')} · ${t('title')}`
  const description = t('h2h.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function H2HPage() {
  const t = useTranslations('worldCup.h2h')
  const teams = getTeams().map((t) => ({
    teamId: t.teamId,
    nameZh: t.nameZh,
    nameEn: t.nameEn,
    code: t.code,
  }))
  const data = getH2H()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">HEAD TO HEAD</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro')}
        </p>
      </header>
      <SectionHeading>{t('pick')}</SectionHeading>
      <H2HExplorer teams={teams} data={data} />
    </WcShell>
  )
}
