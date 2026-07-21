import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import React from 'react'

import { WC_BASE } from '../_lib/nav'
import { type ScoredTeam, type TeamRef } from '../_lib/types'
import { WorldCupNav } from './WorldCupNav'

/* --------------------------- 页面外壳 / 结构 --------------------------- */

/** 面包屑 + 子导航 + 内容 + 数据署名。所有子页面统一套用。 */
export function WcShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-2xl px-4 pb-16 pt-6 sm:mt-24 sm:px-6">
      <nav className="mb-5 flex items-center gap-2 text-xs font-light text-neutral-400 dark:text-neutral-500">
        <Link href="/tools" className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
          工具库
        </Link>
        <span className="text-neutral-300 dark:text-neutral-600">/</span>
        <Link href={WC_BASE} className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
          世界杯历史
        </Link>
      </nav>
      <WorldCupNav />
      <div className="mt-8">{children}</div>
      <AttributionFooter />
    </div>
  )
}

export function AttributionFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 pt-5 text-xs font-light leading-relaxed text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
      数据来源:Joshua C. Fjelstul,“The Fjelstul World Cup Database v.1.2.0”
      (2023)。{' '}
      <a
        href="https://github.com/jfjelstul/worldcup"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        github.com/jfjelstul/worldcup
      </a>
      {' · '}授权协议 CC-BY-SA 4.0。
    </footer>
  )
}

export function SectionHeading({
  children,
  note,
}: {
  children: React.ReactNode
  note?: React.ReactNode
}) {
  return (
    <div className="mb-4 mt-10 flex items-baseline justify-between border-t border-neutral-200 pt-5 dark:border-neutral-800">
      <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        {children}
      </h2>
      {note ? (
        <span className="text-xs font-light text-neutral-400">{note}</span>
      ) : null}
    </div>
  )
}

/* ------------------------------- 统计块 -------------------------------- */

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{children}</div>
  )
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="font-serif text-3xl font-normal tabular-nums text-neutral-900 dark:text-neutral-100">
        {value}
      </div>
      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      {sub ? <div className="text-[11px] text-neutral-400">{sub}</div> : null}
    </div>
  )
}

/* ------------------------------- 球队 ---------------------------------- */

/** ISO 代码方块 + 中文名(不用图片)。reverse 用于比分左侧(名在前)。 */
export function TeamChip({
  team,
  href,
  showName = true,
  reverse = false,
  className,
}: {
  team: TeamRef
  href?: string
  showName?: boolean
  reverse?: boolean
  className?: string
}) {
  const code = (
    <span className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded border border-neutral-300 px-1 font-mono text-[11px] tracking-wider text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      {team.code}
    </span>
  )
  const name = showName ? <span className="truncate">{team.nameZh}</span> : null
  const body = (
    <span
      className={clsxm(
        'inline-flex items-center gap-2',
        reverse && 'flex-row-reverse',
        className
      )}
    >
      {code}
      {name}
    </span>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="text-neutral-900 transition-colors hover:text-orange-700 dark:text-neutral-100 dark:hover:text-orange-500"
      >
        {body}
      </Link>
    )
  }
  return <span className="text-neutral-900 dark:text-neutral-100">{body}</span>
}

/** 一行比分:主队(右对齐)—比分—客队(左对齐)。 */
export function Scoreline({
  home,
  away,
  score,
  meta,
  href,
}: {
  home: ScoredTeam
  away: ScoredTeam
  score?: string
  meta?: React.ReactNode
  href?: string
}) {
  const inner = (
    <div className="flex items-center gap-3 py-2 text-sm">
      <span className="flex flex-1 items-center justify-end gap-2 text-right">
        <TeamChip team={home} reverse showName />
      </span>
      <span className="min-w-[3.25rem] rounded bg-neutral-100 px-2 py-0.5 text-center font-mono text-[13px] tabular-nums text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
        {score ?? `${home.score ?? '-'}–${away.score ?? '-'}`}
      </span>
      <span className="flex flex-1 items-center gap-2">
        <TeamChip team={away} showName />
      </span>
    </div>
  )
  return (
    <div className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60">
      {href ? (
        <Link href={href} className="block hover:bg-neutral-50 dark:hover:bg-neutral-900/60">
          {inner}
        </Link>
      ) : (
        inner
      )}
      {meta ? (
        <div className="pb-2 text-center text-[11px] font-light text-neutral-400">
          {meta}
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------ 数据条 --------------------------------- */

export function DataBar({
  label,
  value,
  max,
  tone = 'strong',
  suffix = '',
}: {
  label: React.ReactNode
  value: number
  max: number
  tone?: 'strong' | 'weak'
  suffix?: string
}) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <span
          className={clsxm(
            'absolute inset-y-0 left-0 rounded-full',
            tone === 'strong' ? 'bg-blue-700' : 'bg-orange-600'
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-neutral-700 dark:text-neutral-300">
        {value}
        {suffix}
      </span>
    </div>
  )
}

const GOAL_BUCKETS = ['1-15', '16-30', '31-45', '46-60', '61-75', '76-90', '90+']

/** 进球时段分布柱状图(7 段:每 15 分钟一段 + 加时/补时)。 */
export function GoalDistribution({ dist }: { dist: number[] }) {
  const max = Math.max(1, ...dist)
  return (
    <div className="flex items-end gap-1.5">
      {dist.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
            {v}
          </span>
          <span className="flex h-24 w-full items-end rounded-t bg-neutral-100 dark:bg-neutral-800">
            <span
              className="w-full rounded-t bg-blue-700"
              style={{ height: `${Math.round((v / max) * 100)}%` }}
            />
          </span>
          <span className="text-[10px] text-neutral-400">{GOAL_BUCKETS[i]}</span>
        </div>
      ))}
    </div>
  )
}
