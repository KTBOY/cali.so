'use client'

import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { WC_BASE } from '../_lib/nav'
import { type TournamentIndexItem } from '../_lib/types'
import { TeamChip } from './ui'

type SortKey = 'year' | 'goals' | 'teams'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'year', label: '年份' },
  { key: 'goals', label: '进球' },
  { key: 'teams', label: '球队数' },
]

export function TournamentsList({
  tournaments,
}: {
  tournaments: TournamentIndexItem[]
}) {
  const [decade, setDecade] = useState<number | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('year')

  const decades = useMemo(() => {
    const set = new Set<number>()
    tournaments.forEach((t) => set.add(Math.floor(t.year / 10) * 10))
    return [...set].sort((a, b) => a - b)
  }, [tournaments])

  const rows = useMemo(() => {
    const filtered =
      decade === 'all'
        ? tournaments
        : tournaments.filter((t) => Math.floor(t.year / 10) * 10 === decade)
    const sorted = [...filtered]
    sorted.sort((a, b) =>
      sort === 'goals'
        ? b.goals - a.goals
        : sort === 'teams'
          ? b.teams - a.teams || b.year - a.year
          : b.year - a.year
    )
    return sorted
  }, [tournaments, decade, sort])

  const pill = (active: boolean) =>
    clsxm(
      'rounded-full border px-3 py-1 text-xs font-normal transition-colors',
      active
        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400'
    )

  return (
    <div>
      {/* 筛选与排序 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button className={pill(decade === 'all')} onClick={() => setDecade('all')}>
          全部
        </button>
        {decades.map((d) => (
          <button key={d} className={pill(decade === d)} onClick={() => setDecade(d)}>
            {d}s
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-xs text-neutral-400">排序</span>
        {SORTS.map((s) => (
          <button key={s.key} className={pill(sort === s.key)} onClick={() => setSort(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <ul className="mt-6">
        {rows.map((t) => (
          <li key={t.year}>
            <Link
              href={`${WC_BASE}/tournaments/${t.year}`}
              className="-mx-3 flex items-center gap-4 border-b border-neutral-100 px-3 py-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/60"
            >
              <div className="w-14 shrink-0 font-serif text-3xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
                {t.year}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 shrink-0 text-xs text-neutral-400">冠军</span>
                  {t.winner ? <TeamChip team={t.winner} /> : <span className="text-neutral-400">—</span>}
                  {t.runnerUp ? (
                    <span className="ml-1 truncate text-xs text-neutral-400">
                      亚军 {t.runnerUp.nameZh}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="w-8 shrink-0 text-neutral-400">主办</span>
                  <span className="truncate">
                    {t.hosts.map((h) => h.nameZh).join('、') || '—'}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                <div>{t.teams} 队</div>
                <div>{t.goals} 球</div>
                <div className="text-neutral-400">{t.goalsPerMatch} 球/场</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
