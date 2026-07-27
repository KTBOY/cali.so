import { clsxm } from '@zolplay/utils'
import { useTranslations } from 'next-intl'

import {
  type MatchBooking,
  type MatchGoalEvent,
  type MatchSub,
} from '../_lib/types'

type TimelineEvent = {
  kind: 'goal' | 'card' | 'sub'
  minute: number | null
  side: 'home' | 'away'
  own?: boolean
  card?: 'yellow' | 'red'
}

/** 横向比赛时间轴:上排主队、下排客队,标记进球 / 红黄牌 / 换人。 */
export function MatchTimeline({
  goals,
  bookings,
  subs,
  extraTime,
}: {
  goals: MatchGoalEvent[]
  bookings: MatchBooking[]
  subs: MatchSub[]
  extraTime: boolean
}) {
  const t = useTranslations('worldCup.match')
  const maxMin = extraTime ? 120 : 90
  const events: TimelineEvent[] = [
    ...goals.map((g): TimelineEvent => ({ kind: 'goal', minute: g.minute, side: g.side, own: g.own })),
    ...bookings.map((b): TimelineEvent => ({ kind: 'card', minute: b.minute, side: b.side, card: b.card })),
    ...subs.map((s): TimelineEvent => ({ kind: 'sub', minute: s.minute, side: s.side })),
  ].filter((e) => e.minute != null)
  if (events.length === 0) return null

  const pos = (m: number | null) =>
    m == null ? 0 : Math.min(100, (Math.min(m, maxMin) / maxMin) * 100)

  const row = (side: 'home' | 'away') =>
    events
      .filter((e) => e.side === side)
      .map((e, i) => (
        <span
          key={i}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos(e.minute)}%` }}
          title={`${e.minute ?? ''}'`}
        >
          {e.kind === 'goal' ? (
            <span
              className={clsxm(
                'block h-2.5 w-2.5 rounded-full',
                e.own ? 'bg-neutral-400' : 'bg-blue-700'
              )}
            />
          ) : null}
          {e.kind === 'card' ? (
            <span
              className={clsxm(
                'block h-3 w-1.5 rounded-sm',
                e.card === 'red' ? 'bg-red-600' : 'bg-amber-400'
              )}
            />
          ) : null}
          {e.kind === 'sub' ? (
            <span className="block h-2 w-2 rotate-45 bg-emerald-500" />
          ) : null}
        </span>
      ))

  return (
    <div className="my-5">
      <div className="relative h-4">{row('home')}</div>
      <div className="relative h-px bg-neutral-200 dark:bg-neutral-700">
        <span className="absolute left-1/2 top-1/2 h-2 w-px -translate-y-1/2 bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="relative h-4">{row('away')}</div>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
        <span>0&apos;</span>
        <span>45&apos;</span>
        <span>{maxMin}&apos;</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-700" />
          {t('legendGoal')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-1.5 rounded-sm bg-amber-400" />
          {t('legendYellow')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-1.5 rounded-sm bg-red-600" />
          {t('legendRed')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rotate-45 bg-emerald-500" />
          {t('legendSub')}
        </span>
        <span>{t('legendRows')}</span>
      </div>
    </div>
  )
}
