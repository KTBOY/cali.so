/**
 * 数据层双语工具 —— 预计算 JSON 中部分字段只有单语，
 * 这里集中做 zh/en 的映射与选择。
 */
import { type TeamRef } from './types'

/** 阶段名:数据层为中文(stageZh),英文界面用映射还原。 */
const STAGE_EN: Record<string, string> = {
  小组赛: 'Group stage',
  '16 强淘汰赛': 'Round of 16',
  四分之一决赛: 'Quarter-finals',
  半决赛: 'Semi-finals',
  三四名决赛: 'Third-place match',
  决赛: 'Final',
  第二阶段小组赛: 'Second group stage',
  决赛圈: 'Final round',
}

/** 战绩(performance)数据层为英文,中文界面用映射。 */
const PERF_ZH: Record<string, string> = {
  final: '决赛',
  'third-place match': '季军战',
  'third place match': '季军战',
  'semi-finals': '半决赛',
  'quarter-finals': '八强',
  'round of 16': '16 强',
  'round of sixteen': '16 强',
  'group stage': '小组赛',
  'second group stage': '复赛小组',
  'final round': '决赛圈',
  'first round': '第一轮',
  'second round': '第二轮',
}

/** 场上位置:数据层为中文。 */
const POS_EN: Record<string, string> = {
  门将: 'Goalkeeper',
  后卫: 'Defender',
  中场: 'Midfielder',
  前锋: 'Forward',
}

export const isZhLocale = (locale: string) => locale === 'zh'

/** 球队显示名:数据自带 nameZh / nameEn。 */
export function teamName(
  team: Pick<TeamRef, 'nameZh' | 'nameEn'>,
  locale: string
) {
  return isZhLocale(locale) ? team.nameZh : team.nameEn
}

/** 阶段显示名(输入为数据层的 stageZh)。 */
export function stageName(stageZh: string, locale: string) {
  return isZhLocale(locale) ? stageZh : STAGE_EN[stageZh] ?? stageZh
}

/** 战绩显示名(输入为数据层的英文 performance)。 */
export function perfName(performance: string, locale: string) {
  if (isZhLocale(locale)) return PERF_ZH[performance] ?? performance
  return performance.charAt(0).toUpperCase() + performance.slice(1)
}

/** 位置显示名(输入为数据层的中文 position)。 */
export function posName(pos: string, locale: string) {
  return isZhLocale(locale) ? pos : POS_EN[pos] ?? pos
}
