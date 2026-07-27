import { type MetadataRoute } from 'next'

import {
  getAllMatchIds,
  getAllPlayerIds,
  getAllTeamSlugs,
  getAllYears,
} from '~/app/(main)/tools/world-cup-history/_lib/data'
import {
  matchHref,
  playerHref,
  teamHref,
  tournamentHref,
  WC_NAV,
} from '~/app/(main)/tools/world-cup-history/_lib/nav'
import { url } from '~/lib'
import { getAllLatestBlogPostSlugs } from '~/sanity/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 前台可收录页面（/ 已 redirect 到 /bz，故只收 /bz）
  const staticPaths = [
    '/bz',
    '/blog',
    '/projects',
    '/guestbook',
    '/game-center',
    '/tools',
    '/tools/gif-compress',
    '/tools/swf-to-exe',
  ]

  // 世界杯模块：8 个栏目页 + 全部静态生成的详情页
  const worldCupPaths = [
    ...WC_NAV.map((item) => item.href),
    ...getAllYears().map(tournamentHref),
    ...getAllTeamSlugs().map(teamHref),
    ...getAllMatchIds().map(matchHref),
    ...getAllPlayerIds().map(playerHref),
  ]

  // Sanity 不可用时降级：仍输出其余页面，避免整个 sitemap 500
  let blogPaths: string[] = []
  try {
    const slugs = await getAllLatestBlogPostSlugs()
    blogPaths = slugs.map((slug) => `/blog/${slug}`)
  } catch (error) {
    console.error('[sitemap] failed to fetch blog slugs:', error)
  }

  return [...staticPaths, ...worldCupPaths, ...blogPaths].map((path) => ({
    url: url(path).href,
  }))
}

export const revalidate = 3600
