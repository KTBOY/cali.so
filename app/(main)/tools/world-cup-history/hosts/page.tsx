import { type Metadata } from 'next'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../_components/ui'
import { getHosts } from '../_lib/data'
import { perfName } from '../_lib/i18n'
import { teamHref, tournamentHref } from '../_lib/nav'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('hosts.title')} · ${t('title')}`
  const description = t('hosts.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function HostsPage() {
  const t = useTranslations('worldCup.hosts')
  const locale = useLocale()
  const { hosts, hostWins } = getHosts()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">HOSTS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro')}
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label={t('statHostings')} value={hosts.length} />
          <Stat label={t('statHostWins')} value={hostWins.length} />
        </StatGrid>
      </div>

      <SectionHeading note={t('sectionNote')}>{t('section')}</SectionHeading>
      <ul>
        {hosts.map((h) => (
          <li key={`${h.year}-${h.teamId}`}>
            <div className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-3 dark:border-neutral-800/70">
              <Link
                href={tournamentHref(h.year)}
                className="w-14 shrink-0 font-serif text-2xl tabular-nums text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100"
              >
                {h.year}
              </Link>
              <span className="min-w-0 flex-1">
                <TeamChip team={h} href={teamHref(h.slug)} />
              </span>
              <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                {perfName(h.performance, locale)}
              </span>
              {h.hostWon ? (
                <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                  {t('wonBadge')}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <SectionHeading note={t('hostWinsNote', { count: hostWins.length })}>
        {t('hostWins')}
      </SectionHeading>
      <ul className="space-y-1.5 text-sm">
        {hostWins.map((h) => (
          <li key={`${h.year}-${h.teamId}`} className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-serif text-base tabular-nums text-neutral-900 dark:text-neutral-100">
              {h.year}
            </span>
            <TeamChip team={h} href={teamHref(h.slug)} />
          </li>
        ))}
      </ul>
    </WcShell>
  )
}
