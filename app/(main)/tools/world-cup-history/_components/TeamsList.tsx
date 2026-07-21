'use client'

import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { teamHref } from '../_lib/nav'
import { type TeamIndexItem } from '../_lib/types'
import { TeamChip } from './ui'

type SortKey = 'titles' | 'appearances' | 'wins' | 'gf'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'titles', label: '夺冠' },
  { key: 'appearances', label: '参赛' },
  { key: 'wins', label: '胜场' },
  { key: 'gf', label: '进球' },
]

export function TeamsList({ teams }: { teams: TeamIndexItem[] }) {
  const [sort, setSort] = useState<SortKey>('titles')
  const rows = useMemo(
    () =>
      [...teams].sort(
        (a, b) =>
          b[sort] - a[sort] ||
          (a.bestFinish ?? 99) - (b.bestFinish ?? 99) ||
          b.matches - a.matches
      ),
    [teams, sort]
  )
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-neutral-400">排序</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={clsxm(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              sort === s.key
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <ul className="mt-6">
        {rows.map((t, i) => (
          <li key={t.teamId}>
            <Link
              href={teamHref(t.slug)}
              className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/60"
            >
              <span className="w-6 shrink-0 text-right font-serif text-sm tabular-nums text-neutral-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <TeamChip team={t} />
              </span>
              <span className="flex shrink-0 items-center gap-3 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                <span className="w-12">{t.titles} 冠</span>
                <span className="w-12">{t.appearances} 届</span>
                <span className="hidden w-16 sm:inline">{t.wins}胜</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
