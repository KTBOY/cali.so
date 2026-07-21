/*
 * World Cup History ETL (Fjelstul -> precomputed JSON)
 * -----------------------------------------------------
 * Dependency-free. Run:  node scripts/worldcup/etl.mjs
 * Raw CSV dir via env WORLDCUP_RAW_DIR (default points at the local ydw clone).
 *
 * Emits editorial-database JSON (men's World Cup only, 1930-2022) into
 * app/(main)/tools/world-cup-history/_data/. ELO-related outputs are omitted.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..', '..')
const RAW_DIR =
  process.env.WORLDCUP_RAW_DIR || 'D:\\my\\ydw\\数据\\_fjelstul\\data-csv'
const OUT_DIR = join(
  REPO,
  'app',
  '(main)',
  'tools',
  'world-cup-history',
  '_data'
)

/* ----------------------------- CSV parsing ----------------------------- */
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  const n = text.length
  for (let i = 0; i < n; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') field += c
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function readTable(name) {
  const rows = parseCSV(readFileSync(join(RAW_DIR, `${name}.csv`), 'utf8'))
  const header = rows[0]
  const out = []
  for (let r = 1; r < rows.length; r++) {
    const rr = rows[r]
    if (rr.length === 1 && rr[0] === '') continue
    const obj = {}
    for (let c = 0; c < header.length; c++) obj[header[c]] = rr[c]
    out.push(obj)
  }
  return out
}

const NA = new Set(['', 'NA', 'not applicable', 'NaN'])
const num = (v) => (NA.has(v) ? null : Number(v))
const txt = (v) => (NA.has(v) ? '' : v)
const bool = (v) => v === '1' || v === 'TRUE' || v === 'true'
const yearOf = (tid) => Number(tid.replace('WC-', ''))
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[''.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* --------------------------- zh dictionaries --------------------------- */
const TEAM_ZH = {
  Algeria: '阿尔及利亚', Angola: '安哥拉', Argentina: '阿根廷',
  Australia: '澳大利亚', Austria: '奥地利', Belgium: '比利时',
  Bolivia: '玻利维亚', 'Bosnia and Herzegovina': '波斯尼亚和黑塞哥维那',
  Brazil: '巴西', Bulgaria: '保加利亚', Cameroon: '喀麦隆', Canada: '加拿大',
  Chile: '智利', China: '中国', 'Chinese Taipei': '中华台北',
  Colombia: '哥伦比亚', 'Costa Rica': '哥斯达黎加', Croatia: '克罗地亚',
  Cuba: '古巴', 'Czech Republic': '捷克', Czechoslovakia: '捷克斯洛伐克',
  Denmark: '丹麦', 'Dutch East Indies': '荷属东印度', 'East Germany': '民主德国',
  Ecuador: '厄瓜多尔', Egypt: '埃及', 'El Salvador': '萨尔瓦多',
  England: '英格兰', 'Equatorial Guinea': '赤道几内亚', France: '法国',
  Germany: '德国', Ghana: '加纳', Greece: '希腊', Haiti: '海地',
  Honduras: '洪都拉斯', Hungary: '匈牙利', Iceland: '冰岛', Iran: '伊朗',
  Iraq: '伊拉克', Israel: '以色列', Italy: '意大利', 'Ivory Coast': '科特迪瓦',
  Jamaica: '牙买加', Japan: '日本', Kuwait: '科威特', Mexico: '墨西哥',
  Morocco: '摩洛哥', Netherlands: '荷兰', 'New Zealand': '新西兰',
  Nigeria: '尼日利亚', 'North Korea': '朝鲜', 'Northern Ireland': '北爱尔兰',
  Norway: '挪威', Panama: '巴拿马', Paraguay: '巴拉圭', Peru: '秘鲁',
  Poland: '波兰', Portugal: '葡萄牙', Qatar: '卡塔尔',
  'Republic of Ireland': '爱尔兰', Romania: '罗马尼亚', Russia: '俄罗斯',
  'Saudi Arabia': '沙特阿拉伯', Scotland: '苏格兰', Senegal: '塞内加尔',
  Serbia: '塞尔维亚', 'Serbia and Montenegro': '塞尔维亚和黑山',
  Slovakia: '斯洛伐克', Slovenia: '斯洛文尼亚', 'South Africa': '南非',
  'South Korea': '韩国', 'Soviet Union': '苏联', Spain: '西班牙',
  Sweden: '瑞典', Switzerland: '瑞士', Thailand: '泰国', Togo: '多哥',
  'Trinidad and Tobago': '特立尼达和多巴哥', Tunisia: '突尼斯', Turkey: '土耳其',
  Ukraine: '乌克兰', 'United Arab Emirates': '阿联酋', 'United States': '美国',
  Uruguay: '乌拉圭', Wales: '威尔士', 'West Germany': '联邦德国',
  Yugoslavia: '南斯拉夫', Zaire: '扎伊尔',
}
const STAGE_ZH = {
  'first round': '第一轮', 'second round': '第二轮', 'group stage': '小组赛',
  'second group stage': '第二阶段小组赛', 'round of 16': '16 强淘汰赛',
  'round of sixteen': '16 强淘汰赛', 'quarter-finals': '四分之一决赛',
  'semi-finals': '半决赛', 'third place match': '三四名决赛',
  'third-place match': '三四名决赛',
  final: '决赛', 'final round': '决赛圈',
}
const STAGE_ORDER = [
  'first round', 'group stage', 'second group stage', 'second round',
  'final round', 'round of 16', 'round of sixteen', 'quarter-finals',
  'semi-finals', 'third place match', 'third-place match', 'final',
]
const stageRank = (s) => {
  const i = STAGE_ORDER.indexOf(s)
  return i === -1 ? 99 : i
}
const zhTeam = (name) => TEAM_ZH[name] || name
const zhStage = (s) => STAGE_ZH[s] || s

/* ------------------------------- load ---------------------------------- */
const tournamentsAll = readTable('tournaments')
const menTournaments = tournamentsAll.filter((t) =>
  t.tournament_name.includes("Men's")
)
const menIds = new Set(menTournaments.map((t) => t.tournament_id))
const isMen = (r) => menIds.has(r.tournament_id)

const teamsRaw = readTable('teams')
const matches = readTable('matches').filter(isMen)
const goals = readTable('goals').filter(isMen)
const teamApps = readTable('team_appearances').filter(isMen)
const standings = readTable('tournament_standings').filter(isMen)
const groupStandings = readTable('group_standings').filter(isMen)
const hostCountries = readTable('host_countries').filter(isMen)
const awardWinners = readTable('award_winners').filter(isMen)
const stadiumsRaw = readTable('stadiums')

/* team_id -> canonical team info (keyed internally by team_id) */
const teamById = new Map()
for (const t of teamsRaw) {
  const nameEn = t.team_name
  // West Germany shares code DEU with Germany in Fjelstul; disambiguate label.
  const displayCode = t.team_id === 'T-86' ? 'FRG' : t.team_code
  teamById.set(t.team_id, {
    teamId: t.team_id,
    code: displayCode,
    isoCode: t.team_code,
    slug: slugify(nameEn),
    nameEn,
    nameZh: zhTeam(nameEn),
    confederation: txt(t.confederation_code),
    region: txt(t.region_name),
  })
}
const teamRef = (id) => {
  const t = teamById.get(id)
  return t
    ? { teamId: id, code: t.code, slug: t.slug, nameEn: t.nameEn, nameZh: t.nameZh }
    : { teamId: id, code: '???', slug: '', nameEn: id, nameZh: id }
}

/* tournament meta map */
const hostsByTournament = new Map()
for (const h of hostCountries) {
  if (!hostsByTournament.has(h.tournament_id))
    hostsByTournament.set(h.tournament_id, [])
  hostsByTournament.get(h.tournament_id).push(teamRef(h.team_id))
}

/* ------------------------------- output -------------------------------- */
function writeJSON(rel, data) {
  const p = join(OUT_DIR, rel)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(data))
  return p
}

/* dict */
writeJSON('dict/teams.json', Object.fromEntries(
  [...teamById.values()].map((t) => [t.teamId, t])
))
writeJSON('dict/stages.json', STAGE_ZH)

/* per-tournament aggregates */
const goalsByTournament = new Map()
for (const g of goals) {
  if (!goalsByTournament.has(g.tournament_id))
    goalsByTournament.set(g.tournament_id, [])
  goalsByTournament.get(g.tournament_id).push(g)
}

function topScorers(tid, limit) {
  const tally = new Map()
  for (const g of goalsByTournament.get(tid) || []) {
    if (bool(g.own_goal)) continue
    const key = g.player_id
    const cur = tally.get(key) || {
      playerId: g.player_id,
      name: `${txt(g.given_name)} ${txt(g.family_name)}`.trim(),
      team: teamRef(g.player_team_id || g.team_id).nameZh,
      goals: 0,
    }
    cur.goals++
    tally.set(key, cur)
  }
  return [...tally.values()].sort((a, b) => b.goals - a.goals).slice(0, limit)
}

const tournamentIndex = []
const dictTournaments = {}

for (const t of menTournaments) {
  const tid = t.tournament_id
  const year = yearOf(tid)
  const hosts = hostsByTournament.get(tid) || []
  const tMatches = matches.filter((m) => m.tournament_id === tid)
  const tGoals = goalsByTournament.get(tid) || []
  const tStand = standings
    .filter((s) => s.tournament_id === tid)
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((s) => ({ position: Number(s.position), ...teamRef(s.team_id) }))
  const winner = tStand.find((s) => s.position === 1)
  const runnerUp = tStand.find((s) => s.position === 2)

  dictTournaments[year] = {
    year,
    nameZh: `${year} 年世界杯`,
    hosts: hosts.map((h) => h.nameZh),
    winner: winner?.nameZh || zhTeam(t.winner),
  }

  tournamentIndex.push({
    year,
    hosts: hosts.map((h) => ({ code: h.code, nameZh: h.nameZh })),
    winner: winner || null,
    runnerUp: runnerUp || null,
    teams: Number(t.count_teams),
    matches: tMatches.length,
    goals: tGoals.length,
    goalsPerMatch: tMatches.length
      ? +(tGoals.length / tMatches.length).toFixed(2)
      : 0,
  })

  /* detail: matches grouped by stage */
  const detailMatches = tMatches
    .map((m) => ({
      matchId: m.match_id,
      date: m.match_date,
      stage: m.stage_name,
      stageZh: zhStage(m.stage_name),
      group: txt(m.group_name),
      home: { ...teamRef(m.home_team_id), score: num(m.home_team_score) },
      away: { ...teamRef(m.away_team_id), score: num(m.away_team_score) },
      score: m.score,
      extraTime: bool(m.extra_time),
      penalties: bool(m.penalty_shootout) ? m.score_penalties : null,
      stadium: txt(m.stadium_name),
      city: txt(m.city_name),
    }))
    .sort(
      (a, b) =>
        (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) ||
        stageRank(a.stage) - stageRank(b.stage)
    )

  const tGroupStand = groupStandings
    .filter((s) => s.tournament_id === tid)
    .map((s) => ({
      group: s.group_name,
      position: Number(s.position),
      ...teamRef(s.team_id),
      played: Number(s.played),
      wins: Number(s.wins),
      draws: Number(s.draws),
      losses: Number(s.losses),
      gf: Number(s.goals_for),
      ga: Number(s.goals_against),
      gd: Number(s.goal_difference),
      points: Number(s.points),
      advanced: bool(s.advanced),
    }))

  const tAwards = awardWinners
    .filter((a) => a.tournament_id === tid)
    .map((a) => ({
      award: a.award_name,
      name: `${txt(a.given_name)} ${txt(a.family_name)}`.trim(),
      team: teamRef(a.team_id).nameZh,
    }))

  const stadiumsUsed = [
    ...new Set(tMatches.map((m) => txt(m.stadium_name)).filter(Boolean)),
  ]

  writeJSON(`tournament/${year}.json`, {
    year,
    nameZh: `${year} 年 FIFA 世界杯`,
    hosts,
    hostWon: bool(t.host_won),
    startDate: t.start_date,
    endDate: t.end_date,
    teams: Number(t.count_teams),
    matchesCount: tMatches.length,
    goalsCount: tGoals.length,
    standings: tStand,
    topScorers: topScorers(tid, 5),
    matchesByStage: groupByStage(detailMatches),
    groups: groupGroups(tGroupStand),
    awards: tAwards,
    stadiums: stadiumsUsed,
  })
}

function groupByStage(ms) {
  const map = new Map()
  for (const m of ms) {
    if (!map.has(m.stage)) map.set(m.stage, { stage: m.stage, stageZh: m.stageZh, matches: [] })
    map.get(m.stage).matches.push(m)
  }
  return [...map.values()].sort((a, b) => stageRank(a.stage) - stageRank(b.stage))
}
function groupGroups(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.group)) map.set(r.group, { group: r.group, rows: [] })
    map.get(r.group).rows.push(r)
  }
  return [...map.values()]
    .sort((a, b) => a.group.localeCompare(b.group))
    .map((g) => ({
      group: g.group,
      rows: g.rows.sort((a, b) => a.position - b.position),
    }))
}

tournamentIndex.sort((a, b) => b.year - a.year)
writeJSON('tournaments.json', tournamentIndex)
writeJSON('dict/tournaments.json', dictTournaments)

/* homepage highlights (non-ELO) */
const distinctTeams = new Set()
for (const m of matches) {
  distinctTeams.add(m.home_team_id)
  distinctTeams.add(m.away_team_id)
}
const withYear = (m) => ({
  matchId: m.match_id,
  year: yearOf(m.tournament_id),
  stageZh: zhStage(m.stage_name),
  home: { ...teamRef(m.home_team_id), score: num(m.home_team_score) },
  away: { ...teamRef(m.away_team_id), score: num(m.away_team_score) },
  total: num(m.home_team_score) + num(m.away_team_score),
  margin: Math.abs(num(m.home_team_score) - num(m.away_team_score)),
})
const enriched = matches.map(withYear)
const biggestMargin = [...enriched]
  .sort((a, b) => b.margin - a.margin || b.total - a.total)
  .slice(0, 6)
const mostGoals = [...enriched]
  .sort((a, b) => b.total - a.total || b.margin - a.margin)
  .slice(0, 6)

/* title tally */
const titleTally = new Map()
for (const s of standings.filter((s) => Number(s.position) === 1)) {
  titleTally.set(s.team_id, (titleTally.get(s.team_id) || 0) + 1)
}
const mostTitles = [...titleTally.entries()]
  .map(([id, n]) => ({ ...teamRef(id), titles: n }))
  .sort((a, b) => b.titles - a.titles)

writeJSON('meta.json', {
  totals: {
    tournaments: menTournaments.length,
    matches: matches.length,
    goals: goals.length,
    teams: distinctTeams.size,
    stadiums: stadiumsRaw.length,
  },
  years: menTournaments.map((t) => yearOf(t.tournament_id)).sort((a, b) => b - a),
  latestWinner: tournamentIndex[0]?.winner || null,
  biggestMargin,
  mostGoals,
  mostTitles,
  attribution:
    'Data: Joshua C. Fjelstul, "The Fjelstul World Cup Database v.1.2.0" (2023). https://github.com/jfjelstul/worldcup · CC-BY-SA 4.0',
})

/* ======================= Phase 2-4 额外数据源 ========================= */
const players = readTable('players')
const squads = readTable('squads').filter(isMen)
const playerApps = readTable('player_appearances').filter(isMen)
const bookings = readTable('bookings').filter(isMen)
const subsRaw = readTable('substitutions').filter(isMen)
const managersApps = readTable('manager_appearances').filter(isMen)
const refereesApps = readTable('referee_appearances').filter(isMen)
const awardsTable = readTable('awards')
const qualified = readTable('qualified_teams').filter(isMen)

const fullName = (g, f) => `${txt(g)} ${txt(f)}`.trim()
function groupBy(rows, key) {
  const m = new Map()
  for (const r of rows) {
    const k = typeof key === 'function' ? key(r) : r[key]
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(r)
  }
  return m
}
const goalsByMatch = groupBy(goals, 'match_id')
const bookingsByMatch = groupBy(bookings, 'match_id')
const subsByMatch = groupBy(subsRaw, 'match_id')
const appsByMatch = groupBy(playerApps, 'match_id')
const refByMatch = groupBy(refereesApps, 'match_id')
const mgrByMatch = groupBy(managersApps, 'match_id')
const side = (m, teamId) => (teamId === m.home_team_id ? 'home' : 'away')

/* ------------------------------ #4/#5 球队 ----------------------------- */
const teamAppsByTeam = groupBy(teamApps, 'team_id')
const teamGoals = goals.filter((g) => !bool(g.own_goal))
const goalsByTeam = groupBy(teamGoals, 'team_id')
const titlesByTeam = new Map()
const bestFinishByTeam = new Map()
for (const s of standings) {
  const pos = Number(s.position)
  if (pos === 1) titlesByTeam.set(s.team_id, (titlesByTeam.get(s.team_id) || 0) + 1)
  const cur = bestFinishByTeam.get(s.team_id)
  if (cur === undefined || pos < cur) bestFinishByTeam.set(s.team_id, pos)
}
function teamAggregate(teamId) {
  const apps = teamAppsByTeam.get(teamId) || []
  let w = 0, d = 0, l = 0, gf = 0, ga = 0
  const years = new Set()
  for (const a of apps) {
    if (bool(a.win)) w++
    else if (bool(a.draw)) d++
    else if (bool(a.lose)) l++
    gf += num(a.goals_for) || 0
    ga += num(a.goals_against) || 0
    years.add(yearOf(a.tournament_id))
  }
  const ys = [...years].sort((x, y) => x - y)
  return {
    matches: apps.length, wins: w, draws: d, losses: l, gf, ga,
    appearances: years.size, firstYear: ys[0] ?? null,
    lastYear: ys[ys.length - 1] ?? null,
    titles: titlesByTeam.get(teamId) || 0,
    bestFinish: bestFinishByTeam.get(teamId) ?? null,
  }
}
const menTeamIds = [...teamAppsByTeam.keys()]
const teamsIndex = menTeamIds
  .map((id) => {
    const t = teamById.get(id)
    return { ...teamRef(id), confederation: t?.confederation || '', region: t?.region || '', ...teamAggregate(id) }
  })
  .sort((a, b) => b.titles - a.titles || (a.bestFinish ?? 99) - (b.bestFinish ?? 99) || b.matches - a.matches)
writeJSON('teams.json', teamsIndex)

const perfByTeamTid = new Map()
for (const q of qualified) perfByTeamTid.set(`${q.team_id}|${q.tournament_id}`, txt(q.performance))
for (const id of menTeamIds) {
  const t = teamById.get(id)
  if (!t) continue
  const apps = teamAppsByTeam.get(id) || []
  const byT = new Map()
  for (const a of apps) {
    const y = yearOf(a.tournament_id)
    if (!byT.has(y)) byT.set(y, { year: y, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, performance: perfByTeamTid.get(`${id}|${a.tournament_id}`) || '' })
    const o = byT.get(y)
    o.played++
    if (bool(a.win)) o.wins++
    else if (bool(a.draw)) o.draws++
    else if (bool(a.lose)) o.losses++
    o.gf += num(a.goals_for) || 0
    o.ga += num(a.goals_against) || 0
  }
  const dist = [0, 0, 0, 0, 0, 0, 0]
  const tGoals = goalsByTeam.get(id) || []
  for (const g of tGoals) {
    const mr = num(g.minute_regulation)
    if (mr === null) continue
    const b = mr <= 15 ? 0 : mr <= 30 ? 1 : mr <= 45 ? 2 : mr <= 60 ? 3 : mr <= 75 ? 4 : mr <= 90 ? 5 : 6
    dist[b]++
  }
  const scorerTally = new Map()
  for (const g of tGoals) {
    const cur = scorerTally.get(g.player_id) || { playerId: g.player_id, name: fullName(g.given_name, g.family_name), goals: 0 }
    cur.goals++
    scorerTally.set(g.player_id, cur)
  }
  const topScorers = [...scorerTally.values()].sort((a, b) => b.goals - a.goals).slice(0, 10)
  writeJSON(`team/${t.slug}.json`, {
    ...teamRef(id), confederation: t.confederation, region: t.region, ...teamAggregate(id),
    byTournament: [...byT.values()].sort((x, y) => y.year - x.year),
    goalDistribution: dist, topScorers,
  })
}

/* ------------------------------ #6 比赛 -------------------------------- */
for (const m of matches) {
  const mid = m.match_id
  const mGoals = (goalsByMatch.get(mid) || [])
    .map((g) => ({ minute: num(g.minute_regulation), label: g.minute_label, side: side(m, g.team_id), scorer: fullName(g.given_name, g.family_name), playerId: g.player_id, own: bool(g.own_goal), penalty: bool(g.penalty) }))
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
  const mBookings = (bookingsByMatch.get(mid) || [])
    .map((b) => ({ minute: num(b.minute_regulation), label: b.minute_label, side: side(m, b.team_id), player: fullName(b.given_name, b.family_name), card: bool(b.red_card) || bool(b.second_yellow_card) ? 'red' : 'yellow' }))
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
  const subMap = new Map()
  for (const s of subsByMatch.get(mid) || []) {
    const k = `${s.team_id}|${s.minute_label}`
    if (!subMap.has(k)) subMap.set(k, { minute: num(s.minute_regulation), label: s.minute_label, side: side(m, s.team_id), on: '', off: '' })
    const o = subMap.get(k)
    if (bool(s.going_off)) o.off = fullName(s.given_name, s.family_name)
    if (bool(s.coming_on)) o.on = fullName(s.given_name, s.family_name)
  }
  const apps = appsByMatch.get(mid) || []
  const lineup = (sd) => {
    const rows = apps.filter((a) => side(m, a.team_id) === sd)
    const mapRow = (a) => ({ num: num(a.shirt_number), name: fullName(a.given_name, a.family_name), pos: txt(a.position_code), playerId: a.player_id })
    return { starters: rows.filter((a) => bool(a.starter)).map(mapRow), subs: rows.filter((a) => bool(a.substitute) && !bool(a.starter)).map(mapRow) }
  }
  const ref = (refByMatch.get(mid) || [])[0]
  const mgrs = mgrByMatch.get(mid) || []
  const mgrSide = (sd) => { const g = mgrs.find((x) => side(m, x.team_id) === sd); return g ? fullName(g.given_name, g.family_name) : '' }
  writeJSON(`match/${mid}.json`, {
    matchId: mid, year: yearOf(m.tournament_id), stage: m.stage_name, stageZh: zhStage(m.stage_name),
    group: txt(m.group_name), date: m.match_date, stadium: txt(m.stadium_name), city: txt(m.city_name),
    home: { ...teamRef(m.home_team_id), score: num(m.home_team_score) },
    away: { ...teamRef(m.away_team_id), score: num(m.away_team_score) },
    extraTime: bool(m.extra_time), penalties: bool(m.penalty_shootout) ? m.score_penalties : null,
    goals: mGoals, bookings: mBookings, subs: [...subMap.values()].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0)),
    lineups: { home: lineup('home'), away: lineup('away') },
    referee: ref ? { name: fullName(ref.given_name, ref.family_name), country: txt(ref.country_name) } : null,
    managers: { home: mgrSide('home'), away: mgrSide('away') },
    hasLineups: apps.length > 0,
  })
}

/* ------------------------------ #7 球员 -------------------------------- */
const playerById = new Map(players.map((p) => [p.player_id, p]))
const goalsByPlayer = groupBy(teamGoals, 'player_id')
const appsByPlayer = groupBy(playerApps, 'player_id')
const squadsByPlayer = groupBy(squads, 'player_id')
const awardsByPlayer = groupBy(awardWinners, 'player_id')
const playerPageIds = new Set([
  ...goalsByPlayer.keys(),
  ...awardsByPlayer.keys(),
  ...appsByPlayer.keys(),
])
for (const pid of playerPageIds) {
  const p = playerById.get(pid)
  const pGoals = goalsByPlayer.get(pid) || []
  const pApps = appsByPlayer.get(pid) || []
  const pSquads = squadsByPlayer.get(pid) || []
  const pAwards = awardsByPlayer.get(pid) || []
  const src = pGoals[0] || pApps[0] || pSquads[0] || pAwards[0]
  const name = src ? fullName(src.given_name, src.family_name) : p ? fullName(p.given_name, p.family_name) : pid
  const teamIds = new Set([...pSquads.map((s) => s.team_id), ...pApps.map((a) => a.team_id), ...pGoals.map((g) => g.player_team_id || g.team_id)])
  const goalsByYear = {}
  for (const g of pGoals) { const y = yearOf(g.tournament_id); goalsByYear[y] = (goalsByYear[y] || 0) + 1 }
  writeJSON(`player/${pid}.json`, {
    playerId: pid, name, birthDate: p ? txt(p.birth_date) : '',
    position: p ? (bool(p.goal_keeper) ? '门将' : bool(p.defender) ? '后卫' : bool(p.midfielder) ? '中场' : bool(p.forward) ? '前锋' : '') : '',
    goals: pGoals.length, goalsByYear, appearances: pApps.length,
    tournaments: [...new Set(pSquads.map((s) => yearOf(s.tournament_id)))].sort((a, b) => a - b),
    teams: [...teamIds].filter(Boolean).map(teamRef),
    awards: pAwards.map((a) => ({ year: yearOf(a.tournament_id), award: a.award_name })).sort((x, y) => y.year - x.year),
  })
}
writeJSON('players-index.json', [...playerPageIds])

/* ------------------------------ #11 主办国 ----------------------------- */
const championByYear = {}
for (const s of standings.filter((s) => Number(s.position) === 1)) championByYear[yearOf(s.tournament_id)] = teamRef(s.team_id)
const tournById = new Map(menTournaments.map((t) => [t.tournament_id, t]))
const hostsOut = hostCountries
  .map((h) => ({ year: yearOf(h.tournament_id), ...teamRef(h.team_id), performance: txt(h.performance), hostWon: bool(tournById.get(h.tournament_id)?.host_won), champion: championByYear[yearOf(h.tournament_id)] || null }))
  .sort((a, b) => b.year - a.year)
writeJSON('hosts.json', { hosts: hostsOut, hostWins: hostsOut.filter((h) => h.hostWon) })

/* ------------------------------ #12 球场 ------------------------------- */
const stadiumMeta = new Map(stadiumsRaw.map((s) => [s.stadium_id, s]))
const stadUse = new Map()
for (const m of matches) {
  const sid = m.stadium_id
  if (!stadUse.has(sid)) {
    const meta = stadiumMeta.get(sid)
    stadUse.set(sid, { name: txt(m.stadium_name), city: txt(m.city_name), country: txt(m.country_name), capacity: meta ? num(meta.stadium_capacity) : null, matches: 0, years: new Set() })
  }
  const o = stadUse.get(sid)
  o.matches++
  o.years.add(yearOf(m.tournament_id))
}
const stadList = [...stadUse.values()].map((s) => {
  const ys = [...s.years]
  return { name: s.name, city: s.city, country: s.country, capacity: s.capacity, matches: s.matches, firstYear: Math.min(...ys), lastYear: Math.max(...ys) }
})
const stadByCountry = [...groupBy(stadList, 'country').entries()]
  .map(([country, list]) => ({ country, count: list.length, stadiums: list.sort((a, b) => b.matches - a.matches) }))
  .sort((a, b) => b.count - a.count)
writeJSON('stadiums.json', { total: stadList.length, byCountry: stadByCountry })

/* ------------------------------ #13 教练裁判 --------------------------- */
function aggPeople(rows, idKey) {
  const m = new Map()
  for (const a of rows) {
    const id = a[idKey]
    if (!m.has(id)) m.set(id, { name: fullName(a.given_name, a.family_name), country: txt(a.country_name), matches: 0, years: new Set() })
    const o = m.get(id)
    o.matches++
    o.years.add(yearOf(a.tournament_id))
  }
  return [...m.values()].map((o) => ({ name: o.name, country: o.country, matches: o.matches, tournaments: o.years.size })).sort((a, b) => b.matches - a.matches || b.tournaments - a.tournaments)
}
const mgrAgg = aggPeople(managersApps, 'manager_id')
const refAgg = aggPeople(refereesApps, 'referee_id')
writeJSON('officials.json', {
  managers: { total: mgrAgg.length, top: mgrAgg.slice(0, 30) },
  referees: { total: refAgg.length, top: refAgg.slice(0, 30) },
})

/* ------------------------------ #14 奖项 ------------------------------- */
const winnersByAward = groupBy(awardWinners, 'award_name')
const awardsOut = awardsTable.map((a) => ({
  name: a.award_name, description: txt(a.award_description), since: num(a.year_introduced),
  winners: (winnersByAward.get(a.award_name) || [])
    .map((w) => ({ year: yearOf(w.tournament_id), player: fullName(w.given_name, w.family_name), team: teamRef(w.team_id).nameZh, playerId: w.player_id }))
    .sort((x, y) => y.year - x.year),
}))
writeJSON('awards.json', awardsOut)

/* ------------------------------ #9 H2H --------------------------------- */
const h2hMap = new Map()
for (const m of matches) {
  const a = m.home_team_id
  const b = m.away_team_id
  const [x, y] = a < b ? [a, b] : [b, a]
  const key = `${x}|${y}`
  if (!h2hMap.has(key))
    h2hMap.set(key, { aId: x, bId: y, played: 0, aWins: 0, bWins: 0, draws: 0, aGoals: 0, bGoals: 0, matches: [] })
  const rec = h2hMap.get(key)
  const hs = num(m.home_team_score) || 0
  const as = num(m.away_team_score) || 0
  const xScore = a === x ? hs : as
  const yScore = a === x ? as : hs
  rec.played++
  rec.aGoals += xScore
  rec.bGoals += yScore
  if (xScore > yScore) rec.aWins++
  else if (yScore > xScore) rec.bWins++
  else rec.draws++
  rec.matches.push({ year: yearOf(m.tournament_id), matchId: m.match_id, stageZh: zhStage(m.stage_name), aScore: xScore, bScore: yScore })
}
const h2hOut = {}
for (const [key, rec] of h2hMap) {
  rec.matches.sort((p, q) => q.year - p.year)
  h2hOut[key] = { a: teamRef(rec.aId), b: teamRef(rec.bId), played: rec.played, aWins: rec.aWins, bWins: rec.bWins, draws: rec.draws, aGoals: rec.aGoals, bGoals: rec.bGoals, matches: rec.matches }
}
writeJSON('h2h.json', h2hOut)

/* ------------------------------ validate ------------------------------- */
const counts = {
  tournaments: menTournaments.length,
  matches: matches.length,
  goals: goals.length,
  teams: distinctTeams.size,
}
console.log('Men\'s World Cup ETL counts:', counts)
// teams=85: Fjelstul counts predecessor/successor states separately (West
// Germany vs Germany, USSR vs Russia, Czechoslovakia vs Czech Republic,
// Yugoslavia vs Serbia & Montenegro). HANDOFF's 80 merges them; per the approved
// plan we keep them separate by team_id, so 85 is the expected figure here.
const expected = { tournaments: 22, matches: 964, goals: 2720, teams: 85 }
const mismatches = Object.keys(expected).filter((k) => counts[k] !== expected[k])
if (counts.tournaments !== 22) {
  throw new Error(`FATAL: expected 22 men's tournaments, got ${counts.tournaments}`)
}
if (mismatches.length) {
  console.warn(
    'WARN count mismatch vs HANDOFF:',
    mismatches.map((k) => `${k}=${counts[k]} (exp ${expected[k]})`).join(', ')
  )
} else {
  console.log('All counts match (22 tournaments / 964 matches / 2720 goals / 85 teams).')
}
console.log('Output written to', OUT_DIR)
