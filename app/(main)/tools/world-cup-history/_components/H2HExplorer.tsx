'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { matchHref } from '../_lib/nav'
import { type H2HData, type TeamIndexItem } from '../_lib/types'

export function H2HExplorer({
  teams,
  data,
}: {
  teams: Pick<TeamIndexItem, 'teamId' | 'nameZh' | 'code'>[]
  data: H2HData
}) {
  const sorted = useMemo(
    () => [...teams].sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh-CN')),
    [teams]
  )
  const [aId, setAId] = useState(sorted[0]?.teamId ?? '')
  const [bId, setBId] = useState(sorted[1]?.teamId ?? '')

  const rec = useMemo(() => {
    if (!aId || !bId || aId === bId) return null
    const [x, y] = aId < bId ? [aId, bId] : [bId, aId]
    return data[`${x}|${y}`] ?? null
  }, [aId, bId, data])

  const teamA = teams.find((t) => t.teamId === aId)
  const teamB = teams.find((t) => t.teamId === bId)
  const aIsRecA = rec?.a.teamId === aId
  const aWins = rec ? (aIsRecA ? rec.aWins : rec.bWins) : 0
  const bWins = rec ? (aIsRecA ? rec.bWins : rec.aWins) : 0
  const aGoals = rec ? (aIsRecA ? rec.aGoals : rec.bGoals) : 0
  const bGoals = rec ? (aIsRecA ? rec.bGoals : rec.aGoals) : 0

  const selCls =
    'flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

  return (
    <div>
      <div className="flex items-center gap-3">
        <select value={aId} onChange={(e) => setAId(e.target.value)} className={selCls}>
          {sorted.map((t) => (
            <option key={t.teamId} value={t.teamId}>
              {t.nameZh}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-neutral-400">vs</span>
        <select value={bId} onChange={(e) => setBId(e.target.value)} className={selCls}>
          {sorted.map((t) => (
            <option key={t.teamId} value={t.teamId}>
              {t.nameZh}
            </option>
          ))}
        </select>
      </div>

      {!rec ? (
        <p className="mt-10 text-center text-sm text-neutral-400">
          {aId === bId ? '请选择两支不同的球队。' : '这两支球队在世界杯上从未交手。'}
        </p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-3 items-end gap-2 text-center">
            <div>
              <div className="font-serif text-5xl font-normal tabular-nums text-blue-700 dark:text-blue-500">
                {aWins}
              </div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {teamA?.nameZh} 胜
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl font-normal tabular-nums text-neutral-400">
                {rec.draws}
              </div>
              <div className="mt-1 text-xs text-neutral-400">平</div>
            </div>
            <div>
              <div className="font-serif text-5xl font-normal tabular-nums text-orange-600">
                {bWins}
              </div>
              <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {teamB?.nameZh} 胜
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-400">
            共交手 {rec.played} 次 · 进球 {aGoals} : {bGoals}
          </p>

          <ul className="mt-8">
            {rec.matches.map((mt) => {
              const aScore = aIsRecA ? mt.aScore : mt.bScore
              const bScore = aIsRecA ? mt.bScore : mt.aScore
              return (
                <li key={mt.matchId}>
                  <Link
                    href={matchHref(mt.matchId)}
                    className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-2.5 text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/60"
                  >
                    <span className="w-12 shrink-0 font-serif tabular-nums text-neutral-500 dark:text-neutral-400">
                      {mt.year}
                    </span>
                    <span className="flex-1 truncate text-xs text-neutral-400">
                      {mt.stageZh}
                    </span>
                    <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                      {aScore}–{bScore}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
