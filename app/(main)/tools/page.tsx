import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '~/components/ui/Container'
import { accentStyles, tools } from '~/config/tools'

const title = '工具库'
const description =
  '一处安静的小工具收纳所。把日常会用到的实用小工具，收拢在同一片留白之中。'

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
  },
} satisfies Metadata

export default function ToolsPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      {/* ============ 日系风格头图 · 和纸留白 ============ */}
      <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.06] bg-gradient-to-b from-orange-50/80 via-rose-50/40 to-white shadow-[0_20px_60px_-32px_rgba(0,0,0,0.25)] dark:border-white/[0.06] dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-900">
        {/* 柔光晕染 */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10" />
        <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />

        <div className="relative px-6 py-16 sm:px-14 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-zinc-500 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400/80" />
            道具箱 · TOOLBOX
          </span>

          <h1 className="mt-7 text-4xl font-semibold tracking-tight text-zinc-800 sm:text-6xl dark:text-zinc-100">
            工具库
          </h1>
          <p className="mt-3 text-sm font-light tracking-[0.35em] text-zinc-400 dark:text-zinc-500">
            みんなの道具箱
          </p>

          <p className="mt-8 max-w-xl text-base font-light leading-loose text-zinc-500 dark:text-zinc-400">
            一处安静的小工具收纳所。<br className="hidden sm:block" />
            把日常会用到的实用小工具，收拢在同一片留白之中，
            <br className="hidden sm:block" />
            用起来，就像取用书桌上顺手的一支笔。
          </p>
        </div>
      </div>

      {/* ============ 工具网格 ============ */}
      <div className="mt-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-lg font-medium text-zinc-700 dark:text-zinc-200">
            全部工具
          </h2>
          <span className="text-xs font-light tracking-widest text-zinc-400">
            {tools.length} 件 · 持续添置中
          </span>
        </div>

        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tools.map((tool) => {
            const accent = accentStyles[tool.accent]
            const card = (
              <div
                className={`group relative h-full overflow-hidden rounded-3xl border border-black/[0.06] bg-white/80 p-1 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] ring-1 ring-transparent backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] dark:border-white/[0.06] dark:bg-white/[0.03] ${accent.ring}`}
              >
                {/* 顶部柔光 */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent.glow} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    {/* 图标 */}
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.chip}`}
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                        />
                      </svg>
                    </span>

                    {tool.available ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        可用
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:bg-white/5">
                        筹备中
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-6 text-[11px] font-light tracking-[0.25em] ${accent.text}`}
                  >
                    {tool.nameJa}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                    {tool.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {tool.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                    {tool.available ? '开始使用' : '敬请期待'}
                    {tool.available && (
                      <svg
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )

            return (
              <li key={tool.slug}>
                {tool.available ? (
                  <Link href={`/tools/${tool.slug}`} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  <div className="h-full cursor-not-allowed opacity-70">
                    {card}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </Container>
  )
}
