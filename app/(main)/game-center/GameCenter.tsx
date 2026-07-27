'use client'

import dynamic from 'next/dynamic'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'

import { type SwfGame, swfGames } from '~/components/GameUi/swfGames'

const FlashPlayer = dynamic(
  () => import('~/components/GameUi/FlashPlayer'),
  { ssr: false }
)

export function GameCenter() {
  const [selectedGame, setSelectedGame] = useState<SwfGame | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const t = useTranslations('gameCenter')
  const locale = useLocale()
  const isZh = locale === 'zh'

  const categories = [
    { key: '全部', label: t('allCategory') },
    ...swfGames.map((c) => ({ key: c.name, label: isZh ? c.name : c.nameEn })),
  ]

  const filteredGames = useCallback(() => {
    if (activeCategory === '全部') {
      return swfGames.flatMap((c) => c.games)
    }
    const category = swfGames.find((c) => c.name === activeCategory)
    return category?.games ?? []
  }, [activeCategory])

  const handleBack = () => {
    setSelectedGame(null)
  }

  // ============ 游戏播放器视图 ============
  if (selectedGame) {
    return (
      <div className="space-y-6">
        {/* 返回按钮和游戏标题 */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-emerald-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.6)] backdrop-blur transition-all hover:border-emerald-400/60 hover:text-emerald-200 hover:shadow-[0_0_28px_-4px_rgba(16,185,129,0.8)]"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t('backToList')}
          </button>
          <h2 className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            {isZh ? selectedGame.name : selectedGame.nameEn}
          </h2>
        </div>

        {/* 游戏播放器 —— 霓虹光晕外框 */}
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-fuchsia-500 opacity-60 blur transition-opacity duration-500 group-hover:opacity-90" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="aspect-[4/3] w-full bg-black">
              <FlashPlayer
                swfUrl={selectedGame.file}
                title={isZh ? selectedGame.name : selectedGame.nameEn}
              />
            </div>
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 p-6 backdrop-blur">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 animate-glow-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.8)]" />
            {t('gameInfo')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {isZh ? selectedGame.description : selectedGame.descriptionEn}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              {isZh ? selectedGame.category : selectedGame.categoryEn}
            </span>
            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              SWF / Flash
            </span>
          </div>
          <p className="mt-5 text-xs text-zinc-500">
            {t('compatTip')}
          </p>
        </div>
      </div>
    )
  }

  // ============ 游戏列表视图 ============
  return (
    <div className="space-y-10">
      {/* 分类筛选 —— 霓虹胶囊 */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const active = activeCategory === category.key
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ${
                active
                  ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-200 shadow-[0_0_22px_-4px_rgba(16,185,129,0.8)]'
                  : 'border border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-emerald-400/30 hover:text-emerald-200'
              }`}
            >
              {active && (
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/20 to-emerald-500/0" />
              )}
              <span className="relative">{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* 游戏网格 */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredGames().map((game, index) => (
          <li key={game.id}>
            <button
              onClick={() => setSelectedGame(game)}
              className="group relative block w-full text-left"
            >
              {/* 霓虹渐变光晕边框 */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/0 via-cyan-500/0 to-fuchsia-500/0 opacity-0 blur-sm transition-all duration-500 group-hover:from-emerald-500/60 group-hover:via-cyan-500/60 group-hover:to-fuchsia-500/60 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-white/20 group-hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.5)]">
                {/* 游戏封面 */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <img
                    src={game.cover}
                    alt={isZh ? game.name : game.nameEn}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    loading="lazy"
                  />

                  {/* 底部渐隐遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  {/* 扫描线动画（悬浮时） */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-x-0 h-1/3 animate-scan-line bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent" />
                  </div>

                  {/* 悬浮播放按钮 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 scale-50 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-500/90 text-white opacity-0 shadow-[0_0_30px_-2px_rgba(16,185,129,0.9)] backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                      <svg
                        className="ml-1 h-7 w-7 drop-shadow"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>

                  {/* 分类标签 */}
                  <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-medium tracking-wide text-emerald-200 backdrop-blur-md">
                    {isZh ? game.category : game.categoryEn}
                  </span>

                  {/* 编号徽章 */}
                  <span className="absolute right-3 top-3 flex h-7 items-center rounded-md border border-white/10 bg-black/50 px-2 font-mono text-xs font-bold text-cyan-300 backdrop-blur-md">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* 游戏信息 */}
                <div className="relative p-5">
                  <h3 className="text-base font-bold tracking-tight text-zinc-100 transition-colors group-hover:text-emerald-300">
                    {isZh ? game.name : game.nameEn}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">
                    {isZh ? game.description : game.descriptionEn}
                  </p>

                  {/* 底部操作条 */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <span className="inline-block h-1.5 w-1.5 animate-glow-pulse rounded-full bg-emerald-400" />
                      {t('playable')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      {t('startGame')}
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* 空状态 */}
      {filteredGames().length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 py-16">
          <p className="text-sm text-zinc-500">{t('emptyCategory')}</p>
        </div>
      )}
    </div>
  )
}
