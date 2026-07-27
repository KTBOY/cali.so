import { type Metadata } from 'next'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { SectionHeading, WcShell } from '../_components/ui'
import { getAwards, getTeams } from '../_lib/data'
import { isZhLocale } from '../_lib/i18n'
import { playerHref } from '../_lib/nav'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldCup')
  const title = `${t('awards.title')} · ${t('title')}`
  const description = t('awards.metaDescription')
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
  }
}

export default function AwardsPage() {
  const t = useTranslations('worldCup.awards')
  const locale = useLocale()
  const isZh = isZhLocale(locale)
  // 获奖记录里的 team 只有中文名,英文界面用映射还原
  const teamEnByZh = new Map(getTeams().map((tm) => [tm.nameZh, tm.nameEn]))
  const awards = getAwards()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">AWARDS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          {t('intro')}
        </p>
      </header>

      {awards.map((a) => (
        <div key={a.name}>
          <SectionHeading
            note={a.since ? t('sinceNote', { year: a.since }) : undefined}
          >
            {a.name}
          </SectionHeading>
          {a.description ? (
            <p className="mb-3 text-xs font-light leading-relaxed text-neutral-400">
              {a.description}
            </p>
          ) : null}
          <ul className="space-y-1.5 text-sm">
            {a.winners.map((w, i) => (
              <li key={`${w.year}-${i}`} className="flex items-baseline gap-3">
                <span className="w-12 shrink-0 font-serif tabular-nums text-neutral-900 dark:text-neutral-100">
                  {w.year}
                </span>
                <Link
                  href={playerHref(w.playerId)}
                  className="text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100"
                >
                  {w.player}
                </Link>
                <span className="text-xs text-neutral-400">
                  {isZh ? w.team : teamEnByZh.get(w.team) ?? w.team}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </WcShell>
  )
}
