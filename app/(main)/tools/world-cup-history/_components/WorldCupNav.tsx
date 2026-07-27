'use client'

import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { WC_BASE, WC_NAV } from '../_lib/nav'

/** 数据库内部横向子导航(可横向滚动),高亮当前分区。 */
export function WorldCupNav() {
  const pathname = usePathname()
  const t = useTranslations('worldCup')
  return (
    <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max items-center gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {WC_NAV.map((item) => {
          const isActive =
            item.href === WC_BASE
              ? pathname === WC_BASE
              : pathname.startsWith(item.href)
          const base =
            'inline-block whitespace-nowrap px-3 py-2 text-sm font-normal transition-colors'
          if (!item.available) {
            return (
              <li key={item.key}>
                <span
                  className={clsxm(
                    base,
                    'cursor-not-allowed text-neutral-300 dark:text-neutral-700'
                  )}
                  title={t('comingSoon')}
                >
                  {t(`nav.${item.key}`)}
                </span>
              </li>
            )
          }
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={clsxm(
                  base,
                  '-mb-px border-b-2',
                  isActive
                    ? 'border-orange-600 text-neutral-900 dark:text-neutral-100'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
