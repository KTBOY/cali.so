/** 世界杯历史数据库 —— 内部子导航配置与路由助手。 */
export const WC_BASE = '/tools/world-cup-history'

export type WcNavItem = {
  key: string
  label: string
  href: string
  available: boolean
}

export const WC_NAV: WcNavItem[] = [
  { key: 'home', label: '首页', href: WC_BASE, available: true },
  { key: 'tournaments', label: '历届', href: `${WC_BASE}/tournaments`, available: true },
  { key: 'teams', label: '球队', href: `${WC_BASE}/teams`, available: true },
  { key: 'h2h', label: '历史交锋', href: `${WC_BASE}/h2h`, available: true },
  { key: 'hosts', label: '主办国', href: `${WC_BASE}/hosts`, available: true },
  { key: 'stadiums', label: '球场', href: `${WC_BASE}/stadiums`, available: true },
  { key: 'officials', label: '教练裁判', href: `${WC_BASE}/officials`, available: true },
  { key: 'awards', label: '奖项', href: `${WC_BASE}/awards`, available: true },
  { key: 'about', label: '关于', href: `${WC_BASE}/about`, available: true },
]

export const tournamentHref = (year: number | string) =>
  `${WC_BASE}/tournaments/${year}`
export const teamHref = (slug: string) => `${WC_BASE}/teams/${slug}`
export const matchHref = (matchId: string) => `${WC_BASE}/matches/${matchId}`
export const playerHref = (playerId: string) => `${WC_BASE}/players/${playerId}`
