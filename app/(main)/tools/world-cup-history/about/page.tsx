import { type Metadata } from 'next'

import { SectionHeading, Stat, StatGrid, WcShell } from '../_components/ui'
import { getMeta } from '../_lib/data'

const title = '关于 · 世界杯历史'
const description =
  '本世界杯历史数据库的数据来源、统计口径与致谢。数据来自 Fjelstul World Cup Database,授权 CC-BY-SA 4.0。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

export default function AboutPage() {
  const meta = getMeta()
  return (
    <WcShell>
      <header>
        <p className="text-xs tracking-[0.3em] text-neutral-400">ABOUT</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-900 dark:text-neutral-100">
          关于本数据库
        </h1>
        <p className="mt-4 text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
          一个只读、静态、纯数据的男足世界杯历史档案。所有页面在构建时一次性算好,
          浏览时不做任何实时计算。
        </p>
      </header>

      <div className="mt-8">
        <StatGrid>
          <Stat label="届" value={meta.totals.tournaments} />
          <Stat label="场比赛" value={meta.totals.matches} />
          <Stat label="粒进球" value={meta.totals.goals} />
          <Stat label="支球队" value={meta.totals.teams} />
        </StatGrid>
      </div>

      <SectionHeading>数据来源</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
        全部数据来自 Joshua C. Fjelstul 的{' '}
        <a
          href="https://github.com/jfjelstul/worldcup"
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline underline-offset-2 dark:text-blue-500"
        >
          The Fjelstul World Cup Database v.1.2.0
        </a>{' '}
        (2023),依据{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline underline-offset-2 dark:text-blue-500"
        >
          CC-BY-SA 4.0
        </a>{' '}
        协议使用。你可以自由下载、再分发本数据,但需署名并以相同协议共享。
      </p>

      <SectionHeading>统计口径</SectionHeading>
      <ul className="space-y-2 text-sm font-light leading-relaxed text-neutral-600 dark:text-neutral-400">
        <li>· 仅包含男足世界杯(1930–2022),共 22 届、964 场、2720 粒进球。</li>
        <li>
          · 已消失或更名的国家队(苏联 SUN、南斯拉夫 YUG、捷克斯洛伐克 CSK、西德
          FRG、东德 DDR 等)按其历史身份各自独立统计,不与继承国合并,因此参赛球队数为 85。
        </li>
        <li>
          · 首发阵容、换人、红黄牌自 1970 年起才有官方记录;更早的比赛仅保留进球等基础数据。
        </li>
        <li>· 国家 3 位代码沿用 Fjelstul 数据库的足球编码(沙特 SAU、科特迪瓦 CIV 等)。</li>
        <li>· 本站不含任何胜率预测或 ELO 评级,只呈现已发生的历史事实。</li>
      </ul>

      <SectionHeading>球员姓名</SectionHeading>
      <p className="text-sm font-light leading-loose text-neutral-600 dark:text-neutral-400">
        球员、教练、裁判姓名保留拉丁原名(如 Pelé、Maradona),球队名、阶段名等已本地化为中文。
      </p>
    </WcShell>
  )
}
