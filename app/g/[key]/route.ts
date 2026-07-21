import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { type NextRequest, NextResponse } from 'next/server'

import { allGames } from '~/components/GameUi/swfGames'

// 必须使用 Node.js 运行时才能读取本地文件；强制动态，避免被静态化缓存
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// SWF 存放在非公开目录（不在 public 下，因此无法被直接静态访问）
const DATA_DIR = path.join(process.cwd(), 'swf-data')

// 白名单：仅允许 swfGames 中登记的文件名，杜绝路径穿越与任意文件读取
const allowedKeys = new Set(
  allGames.map((g) => g.file.replace(/^\/g\//, ''))
)

/**
 * 防盗链 / 防直链下载：
 * 只放行「从本站页面内由脚本发起」的请求（播放引擎在页面里 fetch），
 * 拦截：地址栏直接访问、右键新标签打开、跨站盗链、无来源的爬虫 / 下载器。
 */
function isAllowedRequest(req: NextRequest): boolean {
  const host = req.headers.get('host') || ''
  const dest = req.headers.get('sec-fetch-dest')
  const site = req.headers.get('sec-fetch-site')
  const referer = req.headers.get('referer')

  // 地址栏访问 / 新标签打开都是文档级导航，一律拦截
  if (dest === 'document') return false

  // 同源的脚本请求（引擎在页面里 fetch SWF）
  if (site === 'same-origin' || site === 'same-site') return true

  // 兜底：referer 指向本站
  if (referer) {
    try {
      if (new URL(referer).host === host) return true
    } catch {
      /* 无效 referer，落到拒绝 */
    }
  }

  return false
}

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  if (!isAllowedRequest(req)) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const key = params.key
  if (!allowedKeys.has(key) || key.includes('/') || key.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const buf = await readFile(path.join(DATA_DIR, key))
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-shockwave-flash',
        'Content-Length': String(buf.length),
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
        'Referrer-Policy': 'same-origin',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
