import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const MOEHU_API = 'https://img.moehu.org/pic.php'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') ?? 'img1'
  const num = Math.min(Math.max(Number(searchParams.get('num')) || 12, 1), 24)

  // 仅允许合法的分类 ID 格式（字母/数字/连字符，如 gawr-gura），防止参数注入
  if (!/^[a-zA-Z0-9-]{1,32}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })
  }

  try {
    const url = `${MOEHU_API}?return=json&id=${id}&num=${num}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Upstream responded with ${res.status}`)
    }

    const data = (await res.json()) as { code?: string; pic?: string[] }
    const pics = Array.isArray(data.pic) ? data.pic : []

    return NextResponse.json(
      { pics },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wallpapers' }, { status: 502 })
  }
}
