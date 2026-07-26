/*
 * @Author: zlc
 * @Date: 2025-07-17 20:26:33
 * @LastEditTime: 2025-10-21 14:42:49
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\(main)\page.tsx
 */

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'

import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
// import { Headline } from '~/app/(main)/Headline'
// import { Photos } from '~/app/(main)/Photos'
import { PencilSwooshIcon } from '~/assets'
import { DomainAnnouncementDialog } from '~/components/DomainAnnouncementDialog'

const GoogleAds = dynamic(() => import('~/components/GooleAds/Home'), { ssr: false });
import { Container } from '~/components/ui/Container'

// 游戏卡片骨架屏：数据加载期间先占位，避免白屏
function PostsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/50 dark:bg-zinc-800/80"
        >
          <div className="aspect-[240/135] w-full bg-zinc-200 dark:bg-zinc-700/60" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700/60" />
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700/60" />
            <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700/60" />
          </div>
        </div>
      ))}
    </>
  )
}

export default function BlogHomePage() {
  return (
    <>
      <DomainAnnouncementDialog />
      <Container>
        {/* { <Headline /> }mt-6 grid grid-cols-1 justify-center gap-6 md:grid-cols-[repeat(auto-fit,75%)] lg:grid-cols-[repeat(auto-fit,45%)] lg:gap-8 */}
      </Container>

      {/* {settings?.heroPhotos && <Photos photos={settings.heroPhotos} />} */}

      <Container className="mt-24 md:mt-28">
        <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <PencilSwooshIcon className="h-5 w-5 flex-none" />
          <span className="ml-2">近期游戏</span>
        </h2>
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-1">
          <div className="mt-6 grid grid-cols-1 justify-center gap-6 md:grid-cols-[repeat(auto-fit,75%)] lg:grid-cols-[repeat(auto-fit,31%)] lg:gap-8">
            {/* Suspense 流式渲染：页面骨架立即输出，文章列表异步填充 */}
            <Suspense fallback={<PostsSkeleton />}>
              <BlogPosts limit={1000} />
            </Suspense>

          <GoogleAds client="ca-pub-8512812906555915" slot="2392600980" responsive />
          </div>
        </div>
      </Container >
    </>
  )
}

export const revalidate = 60
