/**
 * 工具库 —— 子工具清单
 *
 * 每个工具都是一个独立的子页面，收纳在 /tools 之下。
 * 新增工具时，在此追加一条记录即可自动出现在工具库入口。
 */
export type ToolItem = {
  /** 路由 slug，对应 /tools/[slug] */
  slug: string
  /** 中文名称 */
  name: string
  /** 日文点缀（用于视觉标签） */
  nameJa: string
  /** 一句话简介 */
  description: string
  /** 是否已上线 */
  available: boolean
  /** 主题色调（日系柔和色），用于卡片装饰 */
  accent: 'sakura' | 'matcha' | 'sky' | 'sunset'
}

export const tools: ToolItem[] = [
  {
    slug: 'swf-to-exe',
    name: 'SWF 转 EXE',
    nameJa: 'フラッシュ変換',
    description:
      '将 Flash 动画 / 游戏（.swf）打包成可独立运行的 Windows 播放器（.exe），无需安装 Flash Player。',
    available: true,
    accent: 'sakura',
  },
  {
    slug: 'gif-compress',
    name: 'GIF 压缩',
    nameJa: 'GIF圧縮',
    description:
      '在浏览器本地压缩 GIF 动图：自动逐级尝试「缩放 + 抽帧 + 调色板量化（带抖动）」组合，取第一个满足目标体积且质量最高的方案，播放总时长保持不变。',
    available: true,
    accent: 'matcha',
  },
  {
    slug: 'world-cup-history',
    name: '世界杯历史',
    nameJa: 'ワールドカップ',
    description:
      '男足世界杯历史数据库（1930–2022）：22 届赛事、964 场比赛、2720 粒进球的编辑型档案，逐届可查赛程、小组积分、射手与奖项。',
    available: true,
    accent: 'sky',
  },
]

export function getTool(slug: string): ToolItem | undefined {
  return tools.find((t) => t.slug === slug)
}

/** 每种色调对应的柔和视觉配置（浅色 / 深色皆适配） */
export const accentStyles: Record<
  ToolItem['accent'],
  {
    /** 卡片顶部柔光渐变 */
    glow: string
    /** 图标底色 */
    chip: string
    /** 强调文字色 */
    text: string
    /** 边框高亮 */
    ring: string
  }
> = {
  sakura: {
    glow: 'from-rose-200/60 via-pink-100/40 to-transparent dark:from-rose-500/20 dark:via-pink-500/10',
    chip: 'bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300',
    text: 'text-rose-500 dark:text-rose-300',
    ring: 'group-hover:ring-rose-300/60 dark:group-hover:ring-rose-400/40',
  },
  matcha: {
    glow: 'from-emerald-200/60 via-lime-100/40 to-transparent dark:from-emerald-500/20 dark:via-lime-500/10',
    chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-300',
    ring: 'group-hover:ring-emerald-300/60 dark:group-hover:ring-emerald-400/40',
  },
  sky: {
    glow: 'from-sky-200/60 via-cyan-100/40 to-transparent dark:from-sky-500/20 dark:via-cyan-500/10',
    chip: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    text: 'text-sky-600 dark:text-sky-300',
    ring: 'group-hover:ring-sky-300/60 dark:group-hover:ring-sky-400/40',
  },
  sunset: {
    glow: 'from-amber-200/60 via-orange-100/40 to-transparent dark:from-amber-500/20 dark:via-orange-500/10',
    chip: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-300',
    ring: 'group-hover:ring-amber-300/60 dark:group-hover:ring-amber-400/40',
  },
}
