import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// 仅允许 MoeHu 及其图床 CDN 域名，防止被当作开放代理滥用
const ALLOWED_HOST_SUFFIXES = [
  'moehu.org',
  'xn--b9wn8umwv.com',
  'sinaimg.cn',
]

function isAllowedHost(hostname: string) {
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (target.protocol !== 'https:' || !isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(target.toString(), { cache: 'no-store' })
    if (!res.ok || !res.body) {
      throw new Error(`Upstream responded with ${res.status}`)
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('gif')
      ? 'gif'
      : contentType.includes('webp')
      ? 'webp'
      : 'jpg'
    const basename = target.pathname.split('/').pop() || `wallpaper.${ext}`
    const filename = basename.includes('.') ? basename : `${basename}.${ext}`

    return new Response(res.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 502 })
  }
}
