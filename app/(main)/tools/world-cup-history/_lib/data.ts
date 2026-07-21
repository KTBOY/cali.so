/**
 * 数据访问层 —— 在服务端(构建期静态生成)读取预计算 JSON。
 * 页面均为静态生成,fs 读取只在构建期发生。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  type AwardItem,
  type H2HData,
  type HostsData,
  type MatchDetail,
  type Meta,
  type OfficialsData,
  type PlayerDetail,
  type StadiumsData,
  type TeamDetail,
  type TeamIndexItem,
  type TournamentDetail,
  type TournamentIndexItem,
} from './types'

const DATA_DIR = join(
  process.cwd(),
  'app',
  '(main)',
  'tools',
  'world-cup-history',
  '_data'
)

function readData<T>(relPath: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, relPath), 'utf8')) as T
}

export function getMeta(): Meta {
  return readData<Meta>('meta.json')
}

export function getTournamentsIndex(): TournamentIndexItem[] {
  return readData<TournamentIndexItem[]>('tournaments.json')
}

export function getTournament(year: number | string): TournamentDetail {
  return readData<TournamentDetail>(`tournament/${year}.json`)
}

export function getAllYears(): number[] {
  return getMeta().years
}

export function getTeams(): TeamIndexItem[] {
  return readData<TeamIndexItem[]>('teams.json')
}

export function getTeam(slug: string): TeamDetail {
  return readData<TeamDetail>(`team/${slug}.json`)
}

export function getMatch(matchId: string): MatchDetail {
  return readData<MatchDetail>(`match/${matchId}.json`)
}

export function getPlayer(playerId: string): PlayerDetail {
  return readData<PlayerDetail>(`player/${playerId}.json`)
}

export function getHosts(): HostsData {
  return readData<HostsData>('hosts.json')
}

export function getStadiums(): StadiumsData {
  return readData<StadiumsData>('stadiums.json')
}

export function getOfficials(): OfficialsData {
  return readData<OfficialsData>('officials.json')
}

export function getAwards(): AwardItem[] {
  return readData<AwardItem[]>('awards.json')
}

export function getH2H(): H2HData {
  return readData<H2HData>('h2h.json')
}

export function getAllTeamSlugs(): string[] {
  return getTeams().map((t) => t.slug)
}

export function getAllMatchIds(): string[] {
  return readdirSync(join(DATA_DIR, 'match'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
}

export function getAllPlayerIds(): string[] {
  return readData<string[]>('players-index.json')
}
