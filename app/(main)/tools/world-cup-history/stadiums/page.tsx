import { type Metadata } from 'next'

import { SectionHeading, Stat, StatGrid, WcShell } from '../_components/ui'
import { getStadiums } from '../_lib/data'

const title = '球场 · 世界杯历史'
const description =
  '举办过男足世界杯比赛的全部球场,按国家分组,含所在城市、容量与承办场次。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function StadiumsPage() {
  const { total, byCountry } = getStadiums()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">STADIUMS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          球场
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          从蒙得维的亚的世纪球场到卢赛尔体育场,世界杯的绿茵故事发生在这些地方。
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="座球场" value={total} />
          <Stat label="个国家" value={byCountry.length} />
        </StatGrid>
      </div>

      {byCountry.map((c) => (
        <div key={c.country}>
          <SectionHeading note={`${c.count} 座`}>{c.country}</SectionHeading>
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
                  {s.matches} 场 ·{' '}
                  {s.firstYear === s.lastYear
                    ? s.firstYear
                    : `${s.firstYear}–${s.lastYear}`}
                  {s.capacity ? ` · 容 ${s.capacity.toLocaleString()}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </WcShell>
  )
}
