'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { BookmarkIcon, ExternalLinkIcon, SparkleIcon } from '~/assets'
import { Button } from '~/components/ui/Button'
import { Dialog } from '~/components/ui/Dialog'

const STORAGE_KEY = 'domain-announcement-ps521-shown'
const NEW_DOMAIN = 'https://www.ps521.asia'
const NEW_DOMAIN_ICON = 'http://localhost:3000'
const NEW_DOMAIN_TITLE = 'PS521 - 珊瑚打码'

export function DomainAnnouncementDialog() {
  const t = useTranslations('announcement')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 本地开发环境或旧域名不弹框
    const SILENT_ORIGINS = [
      NEW_DOMAIN_ICON,
      NEW_DOMAIN,
    ]
    if (SILENT_ORIGINS.includes(window.location.origin)) {
      return
    }

    try {
      const shown = sessionStorage.getItem(STORAGE_KEY)
      if (!shown) {
        setOpen(true)
      }
    } catch {
      // localStorage 不可用时，默认弹出
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // 忽略写入失败
    }
  }

  /**
   * 跨浏览器一键收藏
   * - IE: window.external.AddFavorite
   * - 旧版 Firefox: window.sidebar.addPanel
   * - Chrome / Edge / Safari / 现代 Firefox: 无直接 API，提示快捷键
   */
  const handleAddBookmark = () => {
    const isMac =
      typeof navigator !== 'undefined' &&
      navigator.platform.toUpperCase().includes('MAC')
    const hotkey = isMac ? '⌘ + D' : 'Ctrl + D'

    try {
      // @ts-expect-error - 旧版 Firefox 支持
      if (window.sidebar && typeof window.sidebar.addPanel === 'function') {
        // @ts-expect-error - 旧版 Firefox 支持
        window.sidebar.addPanel(NEW_DOMAIN_TITLE, NEW_DOMAIN, '')
        return
      }
    } catch {
      // 忽略异常，走下面的提示
    }

    // Chrome / Edge / Safari / 现代 Firefox: 提示用户使用快捷键
    alert(t('manualBookmark', { hotkey }))
  }

  const handleVisit = () => {
    window.open(NEW_DOMAIN, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Content className="sm:max-w-md bg-zinc-50">
        {/* 头部：图标 + 标题 */}
        <Dialog.Header>
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-6 w-6 text-teal-500" />
            <Dialog.Title className="text-xl">{t('title')}</Dialog.Title>
          </div>
          <Dialog.Description>
            {t('description')}
          </Dialog.Description>
        </Dialog.Header>

        {/* 域名展示卡片 */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('newDomain')}
          </p>
          <a
            href={NEW_DOMAIN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-lg font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            {NEW_DOMAIN}
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {t('bookmarkTip')}
          </p>
        </div>

        {/* 操作按钮 */}
        <Dialog.Footer className="gap-2 sm:gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleAddBookmark}
          >
            <BookmarkIcon className="h-4 w-4" />
            {t('addBookmark')}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleVisit}
          >
            <ExternalLinkIcon className="h-4 w-4" />
            {t('visitNow')}
          </Button>
        </Dialog.Footer>

        {/* 不再提示 */}
        {/* <div className="text-center">
          <button
            onClick={handleClose}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            知道了，不再提示
          </button>
        </div> */}
      </Dialog.Content>
    </Dialog.Root>
  )
}
