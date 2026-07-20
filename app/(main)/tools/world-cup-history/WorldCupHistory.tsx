'use client'

import { clsxm } from '@zolplay/utils'
import { useEffect, useMemo, useState } from 'react'

import finalsData from './finals.json'

/* ============================ 类型 ============================ */
type Player = {
  num?: number
  name: string
  pos: string
  rating: number
  captain?: boolean
}
type Team = {
  code: string
  name: string
  nameEn: string
  flag: string
  score: number
  pens?: number
  coach: string
  formation: string
  lineup: Player[]
}
type Goal = {
  team: string
  player: string
  minute: number
  note?: string
}
type Tournament = {
  year: number
  host: string
  date: string
  venue: string
  attendance: number
  championCode: string
  scoreline: string
  extra?: string
  motm: string
  summary: string
  home: Team
  away: Team
  goals: Goal[]
}

const tournaments = (finalsData.tournaments as Tournament[]).slice()

/* ============================ 工具函数 ============================ */

/** 世界杯届数（1950 年后连续举办） */
function editionOf(year: number): number {
  return year >= 1950 ? (year - 1950) / 4 + 4 : (year - 1930) / 4 + 1
}

/** 位置归类：门将 / 后卫 / 中场 / 前锋 */
function categoryOf(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (pos === 'GK') return 'GK'
  if (/B$/.test(pos)) return 'DEF'
  if (/M$/.test(pos)) return 'MID'
  return 'FWD'
}

const POS_LABEL: Record<string, string> = {
  GK: '门将',
  RB: '右后卫',
  LB: '左后卫',
  CB: '中后卫',
  RWB: '右翼卫',
  LWB: '左翼卫',
  CDM: '后腰',
  CM: '中场',
  CAM: '前腰',
  RM: '右前卫',
  LM: '左前卫',
  RW: '右边锋',
  LW: '左边锋',
  ST: '前锋',
  CF: '中锋',
}

/** 评分分档（FIFA 赛后评分风格配色） */
function ratingTier(r: number) {
  if (r >= 8.5)
    return {
      chip: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 ring-amber-200/60',
      bar: 'bg-amber-400',
      label: '现象级',
    }
  if (r >= 7.5)
    return {
      chip: 'bg-gradient-to-br from-emerald-400 to-green-600 text-emerald-50 ring-emerald-300/50',
      bar: 'bg-emerald-500',
      label: '出色',
    }
  if (r >= 7.0)
    return {
      chip: 'bg-gradient-to-br from-teal-400 to-cyan-600 text-teal-50 ring-teal-300/50',
      bar: 'bg-teal-500',
      label: '良好',
    }
  if (r >= 6.5)
    return {
      chip: 'bg-gradient-to-br from-sky-400 to-blue-600 text-sky-50 ring-sky-300/50',
      bar: 'bg-sky-500',
      label: '合格',
    }
  return {
    chip: 'bg-gradient-to-br from-zinc-400 to-zinc-600 text-zinc-50 ring-zinc-300/40',
    bar: 'bg-zinc-500',
    label: '平淡',
  }
}

/** 进球图标 */
function goalIcon(note?: string) {
  if (note === '乌龙') return '🔴'
  if (note === '点球') return '🅿️'
  return '⚽'
}

/* ============================ 子组件 ============================ */

function RatingChip({
  r,
  className,
}: {
  r: number
  className?: string
}) {
  const tier = ratingTier(r)
  return (
    <span
      className={clsxm(
        'inline-flex items-center justify-center rounded-md font-bold tabular-nums shadow-sm ring-1',
        tier.chip,
        className,
      )}
    >
      {r.toFixed(1)}
    </span>
  )
}

/** 球场上的球员标记 */
function PitchToken({ p, teamAccent }: { p: Player; teamAccent: string }) {
  const tier = ratingTier(p.rating)
  return (
    <div className="flex w-[18%] flex-col items-center gap-1">
      <div className="relative">
        <div
          className={clsxm(
            'flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold shadow-md ring-2 ring-white/80 sm:h-11 sm:w-11 sm:text-sm',
            teamAccent,
          )}
        >
          {p.num ?? p.pos}
        </div>
        <span
          className={clsxm(
            'absolute -right-1.5 -top-1.5 flex h-4 w-6 items-center justify-center rounded text-[9px] font-bold tabular-nums shadow ring-1 sm:h-5 sm:w-7 sm:text-[10px]',
            tier.chip,
          )}
        >
          {p.rating.toFixed(1)}
        </span>
        {p.captain && (
          <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-black text-yellow-950 shadow ring-1 ring-white/70 sm:h-5 sm:w-5 sm:text-[10px]">
            C
          </span>
        )}
      </div>
      <span className="max-w-[80px] truncate text-center text-[10px] font-medium leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] sm:text-[11px]">
        {p.name}
      </span>
    </div>
  )
}

const PITCH_BANDS: Record<'GK' | 'DEF' | 'MID' | 'FWD', number> = {
  FWD: 18,
  MID: 42,
  DEF: 67,
  GK: 90,
}

function Pitch({ team, home }: { team: Team; home: boolean }) {
  const accent = home
    ? 'bg-white text-emerald-900'
    : 'bg-slate-900 text-white'
  const rows = (['FWD', 'MID', 'DEF', 'GK'] as const).map((cat) => ({
    cat,
    players: team.lineup.filter((p) => categoryOf(p.pos) === cat),
  }))

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 shadow-inner">
      {/* 草坪条纹 */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 to-emerald-700" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.10) 0 12.5%, transparent 12.5% 25%)',
        }}
      />
      {/* 场地线 */}
      <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-white/40" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/2 border-t-2 border-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50" />
      {/* 禁区（上/下） */}
      <div className="pointer-events-none absolute left-1/2 top-3 h-14 w-40 -translate-x-1/2 border-2 border-t-0 border-white/40" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-14 w-40 -translate-x-1/2 border-2 border-b-0 border-white/40" />

      {/* 球员 */}
      {rows.map(({ cat, players }) => (
        <div
          key={cat}
          className="absolute inset-x-0 flex -translate-y-1/2 items-center justify-around px-2"
          style={{ top: `${PITCH_BANDS[cat]}%` }}
        >
          {players.map((p, i) => (
            <PitchToken key={`${p.name}-${i}`} p={p} teamAccent={accent} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** 阵容评分列表（单支球队） */
function RosterCard({ team, motm }: { team: Team; motm: string }) {
  const sorted = team.lineup
  const avg =
    team.lineup.reduce((s, p) => s + p.rating, 0) / team.lineup.length

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur">
      {/* 队伍头 */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">{team.flag}</span>
          <div>
            <p className="text-sm font-bold text-white">{team.name}</p>
            <p className="text-[10px] font-medium tracking-widest text-white/40">
              {team.formation} · {team.coach}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium tracking-wider text-white/40">
            均分
          </p>
          <p className="text-lg font-black tabular-nums text-white">
            {avg.toFixed(2)}
          </p>
        </div>
      </div>
      {/* 球员列表 */}
      <ul className="divide-y divide-white/5">
        {sorted.map((p, i) => {
          const isMotm = p.name === motm
          return (
            <li
              key={`${p.name}-${i}`}
              className={clsxm(
                'flex items-center gap-3 px-4 py-2.5 transition-colors',
                isMotm ? 'bg-yellow-400/10' : 'hover:bg-white/[0.03]',
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-[11px] font-bold tabular-nums text-white/70">
                {p.num ?? '·'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <span className="truncate">{p.name}</span>
                  {p.captain && (
                    <span className="rounded bg-yellow-400 px-1 text-[9px] font-black text-yellow-950">
                      C
                    </span>
                  )}
                  {isMotm && (
                    <span className="rounded bg-gradient-to-r from-yellow-400 to-amber-500 px-1.5 text-[9px] font-black text-yellow-950">
                      MVP
                    </span>
                  )}
                </p>
                <p className="text-[10px] font-medium tracking-wide text-white/40">
                  {POS_LABEL[p.pos] ?? p.pos}
                </p>
              </div>
              <RatingChip r={p.rating} className="h-7 w-11 text-sm" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ============================ 主组件 ============================ */

export function WorldCupHistory() {
  const [year, setYear] = useState<number>(tournaments[0]?.year ?? 2022)
  const [tab, setTab] = useState<'pitch' | 'ratings'>('pitch')
  const [side, setSide] = useState<'home' | 'away'>('home')

  const t = useMemo(
    () => tournaments.find((x) => x.year === year) ?? tournaments[0],
    [year],
  )

  // 切换届数时，默认展示夺冠球队的阵型
  useEffect(() => {
    if (!t) return
    setSide(t.home.code === t.championCode ? 'home' : 'away')
  }, [t])

  if (!t) return null

  const homeChampion = t.home.code === t.championCode
  const pitchTeam = t[side]

  return (
    <div className="space-y-6">
      {/* ============ 届数选择 ============ */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tournaments.map((x) => {
          const active = x.year === year
          return (
            <button
              key={x.year}
              type="button"
              onClick={() => setYear(x.year)}
              className={clsxm(
                'shrink-0 rounded-xl border px-4 py-2 text-center transition-all',
                active
                  ? 'border-sky-400/60 bg-sky-500/15 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
              )}
            >
              <span
                className={clsxm(
                  'block text-base font-black tabular-nums',
                  active ? 'text-sky-300' : 'text-white/80',
                )}
              >
                {x.year}
              </span>
              <span className="block text-[10px] font-medium text-white/40">
                {x.host}
              </span>
            </button>
          )
        })}
      </div>

      {/* ============ 记分牌 ============ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-sky-300/80">
            <span className="h-px w-6 bg-sky-300/40" />
            第 {editionOf(t.year)} 届 · FIFA 世界杯决赛
            <span className="h-px w-6 bg-sky-300/40" />
          </div>

          {/* 比分 */}
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            {/* 主队 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl leading-none sm:text-6xl">
                {t.home.flag}
              </span>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-white sm:text-lg">
                {t.home.name}
                {homeChampion && <span title="冠军">👑</span>}
              </p>
              <p className="text-[10px] font-medium tracking-[0.2em] text-white/40">
                {t.home.nameEn}
              </p>
            </div>

            {/* 比分 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-4xl font-black tabular-nums text-white sm:text-6xl">
                <span className={clsxm(homeChampion && 'text-yellow-300')}>
                  {t.home.score}
                </span>
                <span className="text-white/30">:</span>
                <span className={clsxm(!homeChampion && 'text-yellow-300')}>
                  {t.away.score}
                </span>
              </div>
              {(t.home.pens != null || t.away.pens != null) && (
                <p className="mt-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/80">
                  点球 {t.home.pens}-{t.away.pens}
                </p>
              )}
              {t.extra && (
                <p className="mt-1.5 text-center text-[10px] font-medium text-sky-300/70">
                  {t.extra}
                </p>
              )}
            </div>

            {/* 客队 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl leading-none sm:text-6xl">
                {t.away.flag}
              </span>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-white sm:text-lg">
                {t.away.name}
                {!homeChampion && <span title="冠军">👑</span>}
              </p>
              <p className="text-[10px] font-medium tracking-[0.2em] text-white/40">
                {t.away.nameEn}
              </p>
            </div>
          </div>

          {/* 赛事信息 */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-white/50">
            <span>📅 {t.date}</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>📍 {t.venue}</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>👥 {t.attendance.toLocaleString()} 人</span>
          </div>

          {/* 全场最佳 */}
          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 px-4 py-1.5">
              <span className="text-sm">🏅</span>
              <span className="text-[11px] font-medium tracking-wider text-yellow-200/70">
                全场最佳
              </span>
              <span className="text-sm font-bold text-yellow-100">
                {t.motm}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============ 进球时间轴 ============ */}
      {t.goals.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50">
            <span>⚽</span> 进球记录
          </h3>
          <ol className="space-y-2">
            {t.goals.map((g, i) => {
              const scoringTeam = g.team === t.home.code ? t.home : t.away
              const left = g.team === t.home.code
              return (
                <li
                  key={i}
                  className={clsxm(
                    'flex items-center gap-3',
                    left ? 'flex-row' : 'flex-row-reverse text-right',
                  )}
                >
                  <span className="flex h-8 min-w-[3rem] items-center justify-center rounded-lg bg-white/10 px-2 text-xs font-bold tabular-nums text-white">
                    {g.minute}
                    {g.note === '+1' ? '+1' : "'"}
                  </span>
                  <span className="text-lg">
                    {goalIcon(g.note === '+1' ? undefined : g.note)}
                  </span>
                  <div
                    className={clsxm(
                      'flex items-center gap-2',
                      !left && 'flex-row-reverse',
                    )}
                  >
                    <span className="text-base">{scoringTeam.flag}</span>
                    <span className="text-sm font-semibold text-white">
                      {g.player}
                    </span>
                    {g.note && g.note !== '+1' && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
                        {g.note}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* ============ 赛况简述 ============ */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <p className="text-sm font-light leading-relaxed text-white/70">
          {t.summary}
        </p>
      </div>

      {/* ============ 标签切换 ============ */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setTab('pitch')}
          className={clsxm(
            'rounded-full px-5 py-2 text-sm font-bold transition-all',
            tab === 'pitch'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
          )}
        >
          阵型图
        </button>
        <button
          type="button"
          onClick={() => setTab('ratings')}
          className={clsxm(
            'rounded-full px-5 py-2 text-sm font-bold transition-all',
            tab === 'ratings'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
          )}
        >
          球员评分
        </button>
      </div>

      {/* ============ 阵型图 ============ */}
      {tab === 'pitch' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur sm:p-6">
          {/* 队伍切换 */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {(['home', 'away'] as const).map((s) => {
              const team = t[s]
              const active = side === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={clsxm(
                    'flex items-center gap-2 rounded-xl border px-4 py-2 transition-all',
                    active
                      ? 'border-sky-400/60 bg-sky-500/15'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
                  )}
                >
                  <span className="text-lg">{team.flag}</span>
                  <span
                    className={clsxm(
                      'text-sm font-bold',
                      active ? 'text-white' : 'text-white/60',
                    )}
                  >
                    {team.name}
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/50">
                    {team.formation}
                  </span>
                </button>
              )
            })}
          </div>

          <Pitch team={pitchTeam} home={side === 'home'} />

          <p className="mt-4 text-center text-[11px] font-light text-white/40">
            主教练：{pitchTeam.coach} · 阵型 {pitchTeam.formation} · 圆点右上角为球员评分
          </p>
        </div>
      )}

      {/* ============ 球员评分 ============ */}
      {tab === 'ratings' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <RosterCard team={t.home} motm={t.motm} />
          <RosterCard team={t.away} motm={t.motm} />
        </div>
      )}

      {/* ============ 评分图例 ============ */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3">
        {[
          { r: 8.5, t: '8.5+ 现象级' },
          { r: 7.5, t: '7.5+ 出色' },
          { r: 7.0, t: '7.0+ 良好' },
          { r: 6.5, t: '6.5+ 合格' },
          { r: 6.0, t: '<6.5 平淡' },
        ].map((x) => (
          <span key={x.t} className="flex items-center gap-1.5">
            <RatingChip r={x.r} className="h-5 w-9 text-[11px]" />
            <span className="text-[11px] font-medium text-white/50">
              {x.t.split(' ')[1]}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
