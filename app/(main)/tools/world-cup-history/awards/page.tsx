import { type Metadata } from 'next'
import Link from 'next/link'

import { SectionHeading, WcShell } from '../_components/ui'
import { getAwards } from '../_lib/data'
import { playerHref } from '../_lib/nav'

const title = '奖项 · 世界杯历史'
const description =
  '世界杯个人奖项(金球奖、金靴奖、金手套、最佳新秀等)的历届得主。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function AwardsPage() {
  const awards = getAwards()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">AWARDS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          奖项
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          金球、金靴、金手套、最佳新秀——世界杯为个人荣耀准备的奖杯,以及它们历届的归属。
        </p>
      </header>

      {awards.map((a) => (
        <div key={a.name}>
          <SectionHeading note={a.since ? `始于 ${a.since}` : undefined}>
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
                <span className="text-xs text-neutral-400">{w.team}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </WcShell>
  )
}
