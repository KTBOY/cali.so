import { type Metadata } from 'next'

import { H2HExplorer } from '../_components/H2HExplorer'
import { SectionHeading, WcShell } from '../_components/ui'
import { getH2H, getTeams } from '../_lib/data'

const title = '历史交锋 · 世界杯历史'
const description =
  '任选两支球队,查看它们在历届世界杯正赛中的全部交手记录与比分。仅统计历史事实,不含预测。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function H2HPage() {
  const teams = getTeams().map((t) => ({
    teamId: t.teamId,
    nameZh: t.nameZh,
    code: t.code,
  }))
  const data = getH2H()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">HEAD TO HEAD</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          历史交锋
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          选择两支球队,查看它们在历届世界杯正赛中的全部交手记录。只呈现历史事实,不含任何预测。
        </p>
      </header>
      <SectionHeading>选择对阵</SectionHeading>
      <H2HExplorer teams={teams} data={data} />
    </WcShell>
  )
}
