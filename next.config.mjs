/*
 * @Author: zlc
 * @Date: 2025-09-02 19:47:20
 * @LastEditTime: 2025-10-09 17:15:43
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\next.config.mjs
 */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./env.mjs'))

import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      }
    ],
  },

  experimental: {
    taint: true,
    // 将非 public 目录的 SWF 文件打包进 /g/[key] 路由的 Serverless Function
    outputFileTracingIncludes: {
      '/g/[key]': ['./swf-data/**/*'],
      // sitemap 运行时读取世界杯预计算 JSON，需随函数打包
      '/sitemap.xml': ['./app/(main)/tools/world-cup-history/_data/**/*'],
    },
  },

  redirects() {
    return [
      {
        // 首页暂时隐藏，壁纸中心作为首页（恢复时删除此条即可）
        "source": "/",
        "destination": "/bz",
        "permanent": false
      },
      {
        "source": "/twitter",
        "destination": "https://x.com/thecalicastle",
        "permanent": true
      },
      {
        "source": "/x",
        "destination": "https://x.com/thecalicastle",
        "permanent": true
      },
      {
        "source": "/youtube",
        "destination": "https://youtube.com/@calicastle",
        "permanent": true
      },
      {
        "source": "/tg",
        "destination": "https://t.me/cali_so",
        "permanent": true
      },
      {
        "source": "/linkedin",
        "destination": "https://www.linkedin.com/in/calicastle/",
        "permanent": true
      },
      {
        "source": "/github",
        "destination": "https://github.com/CaliCastle",
        "permanent": true
      },
      {
        "source": "/bilibili",
        "destination": "https://space.bilibili.com/8350251",
        "permanent": true
      }
    ]
  },

  rewrites() {
    return [
      {
        source: '/feed',
        destination: '/feed.xml',
      },
      {
        source: '/rss',
        destination: '/feed.xml',
      },
      {
        source: '/rss.xml',
        destination: '/feed.xml',
      },
    ]
  },

}

export default withNextIntl(nextConfig)
