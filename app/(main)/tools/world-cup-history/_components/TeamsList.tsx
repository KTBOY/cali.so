'use client'

import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { teamHref } from '../_lib/nav'
import { type TeamIndexItem } from '../_lib/types'
import { TeamChip } from './ui'

type SortKey = 'titles' | 'appearances' | 'wins' | 'gf'

const SORT_KEYS: SortKey[] = ['titles', 'appearances', 'wins', 'gf']

export function TeamsList({ teams }: { teams: TeamIndexItem[] }) {
  const t = useTranslations('worldCup.teams')
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
        <span className="text-xs text-neutral-400">{t('sortLabel')}</span>
        {SORT_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setSort(k)}
            className={clsxm(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              sort === k
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400'
            )}
          >
            {t(`sort${k.charAt(0).toUpperCase()}${k.slice(1)}`)}
          </button>
        ))}
      </div>
      <ul className="mt-6">
        {rows.map((tm, i) => (
          <li key={tm.teamId}>
            <Link
              href={teamHref(tm.slug)}
              className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/60"
            >
              <span className="w-6 shrink-0 text-right font-serif text-sm tabular-nums text-neutral-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <TeamChip team={tm} />
              </span>
              <span className="flex shrink-0 items-center gap-3 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                <span className="w-12">{t('titlesShort', { count: tm.titles })}</span>
                <span className="w-12">
                  {t('appearancesShort', { count: tm.appearances })}
                </span>
                <span className="hidden w-16 sm:inline">
                  {t('winsShort', { count: tm.wins })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
