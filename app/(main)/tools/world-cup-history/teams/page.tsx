import { type Metadata } from 'next'

import { TeamsList } from '../_components/TeamsList'
import { SectionHeading, WcShell } from '../_components/ui'
import { getTeams } from '../_lib/data'

const title = '球队 · 世界杯历史'
const description =
  '参加过男足世界杯的全部球队排行:夺冠次数、参赛届数、胜负与进球，可按不同维度排序。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function TeamsPage() {
  const teams = getTeams()
  return (
    <WcShell>
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          TEAMS
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          球队
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          共 {teams.length} 支球队踢过男足世界杯决赛圈。含历史上已消失的国家队（如苏联、南斯拉夫、西德），
          按 team_id 各自独立计。点击查看每支球队的 DNA 档案。
        </p>
      </header>
      <SectionHeading note={`${teams.length} 支`}>全部球队</SectionHeading>
      <TeamsList teams={teams} />
    </WcShell>
  )
}
