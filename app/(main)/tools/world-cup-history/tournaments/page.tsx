import { type Metadata } from 'next'

import { TournamentsList } from '../_components/TournamentsList'
import { SectionHeading, WcShell } from '../_components/ui'
import { getMeta, getTournamentsIndex } from '../_lib/data'

const title = '历届赛事 · 世界杯历史'
const description =
  '1930–2022 年 22 届男足世界杯一览：主办国、冠亚军、参赛球队数与总进球，可按年代筛选、按年份 / 进球 / 球队数排序。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function TournamentsPage() {
  const tournaments = getTournamentsIndex()
  const meta = getMeta()

  return (
    <WcShell>
      <header>
        <p className="text-xs font-normal tracking-[0.3em] text-neutral-400">
          TOURNAMENTS
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          历届赛事
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          自 1930 至 2022，男足世界杯共举办 {meta.totals.tournaments}{' '}
          届。点击任意一届，查看当届的完整赛程、小组积分、射手与奖项。
        </p>
      </header>

      <SectionHeading note={`共 ${tournaments.length} 届`}>全部赛事</SectionHeading>
      <TournamentsList tournaments={tournaments} />
    </WcShell>
  )
}
