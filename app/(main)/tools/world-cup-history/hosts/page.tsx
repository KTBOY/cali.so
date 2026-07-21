import { type Metadata } from 'next'
import Link from 'next/link'

import { SectionHeading, Stat, StatGrid, TeamChip, WcShell } from '../_components/ui'
import { getHosts } from '../_lib/data'
import { teamHref, tournamentHref } from '../_lib/nav'

const PERF_ZH: Record<string, string> = {
  final: '决赛',
  'third-place match': '季军战',
  'third place match': '季军战',
  'semi-finals': '半决赛',
  'quarter-finals': '八强',
  'round of 16': '16 强',
  'round of sixteen': '16 强',
  'group stage': '小组赛',
  'second group stage': '复赛小组',
  'final round': '决赛圈',
}

const title = '主办国 · 世界杯历史'
const description = '历届世界杯主办国及其成绩,以及"东道主夺冠"发生过的年份。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function HostsPage() {
  const { hosts, hostWins } = getHosts()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">HOSTS</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          主办国
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          谁在自家门口举办过世界杯,又踢出了怎样的成绩。东道主是否更容易夺冠?数据在此。
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="主办国·次" value={hosts.length} />
          <Stat label="东道主夺冠" value={hostWins.length} />
        </StatGrid>
      </div>

      <SectionHeading note="历届">主办与成绩</SectionHeading>
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
                {PERF_ZH[h.performance] ?? h.performance}
              </span>
              {h.hostWon ? (
                <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                  夺冠
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <SectionHeading note={`${hostWins.length} 次`}>东道主夺冠</SectionHeading>
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
