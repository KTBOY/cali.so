/**
 * 世界杯历史数据库 —— 页面消费的预计算 JSON 的 TS 类型。
 * 由 scripts/worldcup/etl.mjs 生成的 _data/*.json 结构对应。
 */
export type TeamRef = {
  teamId: string
  code: string
  slug: string
  nameEn: string
  nameZh: string
}

export type RankedTeam = TeamRef & { position: number }
export type ScoredTeam = TeamRef & { score: number | null }

export type HighlightMatch = {
  matchId: string
  year: number
  stageZh: string
  home: ScoredTeam
  away: ScoredTeam
  total: number
  margin: number
}

export type Meta = {
  totals: {
    tournaments: number
    matches: number
    goals: number
    teams: number
    stadiums: number
  }
  years: number[]
  latestWinner: RankedTeam | null
  biggestMargin: HighlightMatch[]
  mostGoals: HighlightMatch[]
  mostTitles: (TeamRef & { titles: number })[]
  attribution: string
}

export type TournamentIndexItem = {
  year: number
  hosts: { code: string; nameZh: string }[]
  winner: RankedTeam | null
  runnerUp: RankedTeam | null
  teams: number
  matches: number
  goals: number
  goalsPerMatch: number
}

export type DetailMatch = {
  matchId: string
  date: string
  stage: string
  stageZh: string
  group: string
  home: ScoredTeam
  away: ScoredTeam
  score: string
  extraTime: boolean
  penalties: string | null
  stadium: string
  city: string
}

export type StageGroup = {
  stage: string
  stageZh: string
  matches: DetailMatch[]
}

export type GroupStandingRow = TeamRef & {
  group: string
  position: number
  played: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  gd: number
  points: number
  advanced: boolean
}

export type GroupBlock = { group: string; rows: GroupStandingRow[] }

export type TournamentAward = { award: string; name: string; team: string }

export type TopScorer = {
  playerId: string
  name: string
  team: string
  goals: number
}

export type TournamentDetail = {
  year: number
  nameZh: string
  hosts: TeamRef[]
  hostWon: boolean
  startDate: string
  endDate: string
  teams: number
  matchesCount: number
  goalsCount: number
  standings: RankedTeam[]
  topScorers: TopScorer[]
  matchesByStage: StageGroup[]
  groups: GroupBlock[]
  awards: TournamentAward[]
  stadiums: string[]
}

/* ----------------------------- #4/#5 球队 ----------------------------- */
export type TeamIndexItem = TeamRef & {
  confederation: string
  region: string
  matches: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  appearances: number
  firstYear: number | null
  lastYear: number | null
  titles: number
  bestFinish: number | null
}

export type TeamTournamentRow = {
  year: number
  played: number
  wins: number
  draws: number
  losses: number
  gf: number
  ga: number
  performance: string
}

export type TeamDetail = TeamIndexItem & {
  byTournament: TeamTournamentRow[]
  goalDistribution: number[]
  topScorers: { playerId: string; name: string; goals: number }[]
}

/* ------------------------------- #6 比赛 ------------------------------- */
export type MatchSide = 'home' | 'away'
export type MatchGoalEvent = {
  minute: number | null
  label: string
  side: MatchSide
  scorer: string
  playerId: string
  own: boolean
  penalty: boolean
}
export type MatchBooking = {
  minute: number | null
  label: string
  side: MatchSide
  player: string
  card: 'yellow' | 'red'
}
export type MatchSub = {
  minute: number | null
  label: string
  side: MatchSide
  on: string
  off: string
}
export type LineupPlayer = {
  num: number | null
  name: string
  pos: string
  playerId: string
}
export type MatchDetail = {
  matchId: string
  year: number
  stage: string
  stageZh: string
  group: string
  date: string
  stadium: string
  city: string
  home: ScoredTeam
  away: ScoredTeam
  extraTime: boolean
  penalties: string | null
  goals: MatchGoalEvent[]
  bookings: MatchBooking[]
  subs: MatchSub[]
  lineups: {
    home: { starters: LineupPlayer[]; subs: LineupPlayer[] }
    away: { starters: LineupPlayer[]; subs: LineupPlayer[] }
  }
  referee: { name: string; country: string } | null
  managers: { home: string; away: string }
  hasLineups: boolean
}

/* ------------------------------- #7 球员 ------------------------------- */
export type PlayerDetail = {
  playerId: string
  name: string
  birthDate: string
  position: string
  goals: number
  goalsByYear: Record<string, number>
  appearances: number
  tournaments: number[]
  teams: TeamRef[]
  awards: { year: number; award: string }[]
}

/* --------------------------- #11-#14 其他页 --------------------------- */
export type HostRow = TeamRef & {
  year: number
  performance: string
  hostWon: boolean
  champion: TeamRef | null
}
export type HostsData = { hosts: HostRow[]; hostWins: HostRow[] }

export type StadiumRow = {
  name: string
  city: string
  country: string
  capacity: number | null
  matches: number
  firstYear: number
  lastYear: number
}
export type StadiumsData = {
  total: number
  byCountry: { country: string; count: number; stadiums: StadiumRow[] }[]
}

export type OfficialPerson = {
  name: string
  country: string
  matches: number
  tournaments: number
}
export type OfficialsData = {
  managers: { total: number; top: OfficialPerson[] }
  referees: { total: number; top: OfficialPerson[] }
}

export type AwardItem = {
  name: string
  description: string
  since: number | null
  winners: { year: number; player: string; team: string; playerId: string }[]
}

/* ------------------------------- #9 H2H ------------------------------- */
export type H2HRecord = {
  a: TeamRef
  b: TeamRef
  played: number
  aWins: number
  bWins: number
  draws: number
  aGoals: number
  bGoals: number
  matches: { year: number; matchId: string; stageZh: string; aScore: number; bScore: number }[]
}
export type H2HData = Record<string, H2HRecord>
