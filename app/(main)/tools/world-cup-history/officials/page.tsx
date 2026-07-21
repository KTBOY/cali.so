import { type Metadata } from 'next'

import { SectionHeading, WcShell } from '../_components/ui'
import { getOfficials } from '../_lib/data'
import { type OfficialPerson } from '../_lib/types'

const title = '教练与裁判 · 世界杯历史'
const description =
  '执教场次最多的名帅与执法场次最多的名哨:世界杯赛场上的另一群主角。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

function PeopleList({ people }: { people: OfficialPerson[] }) {
  return (
    <ul className="mt-4">
      {people.map((p, i) => (
        <li
          key={`${p.name}-${i}`}
          className="-mx-3 flex items-center gap-3 border-b border-neutral-100 px-3 py-2.5 text-sm dark:border-neutral-800/60"
        >
          <span className="w-6 shrink-0 text-right font-serif tabular-nums text-neutral-400">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-neutral-900 dark:text-neutral-100">
            {p.name}
            <span className="ml-2 text-xs text-neutral-400">{p.country}</span>
          </span>
          <span className="shrink-0 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
            {p.matches} 场 · {p.tournaments} 届
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function OfficialsPage() {
  const { managers, referees } = getOfficials()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">
          MANAGERS &amp; REFEREES
        </p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          教练与裁判
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          共 {managers.total} 位主帅与 {referees.total} 位主裁执掌过世界杯。以下是执教 /
          执法场次最多的名字。
        </p>
      </header>

      <SectionHeading note="执教场次">名帅</SectionHeading>
      <PeopleList people={managers.top} />

      <SectionHeading note="执法场次">名哨</SectionHeading>
      <PeopleList people={referees.top} />
    </WcShell>
  )
}
