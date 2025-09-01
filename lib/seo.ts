export const seo = {
  title: 'steam单机游戏',
  description:
    '免费下载，全部可玩',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://www.ps520.asia/'
      : 'http://localhost:3000'
  ),
} as const
