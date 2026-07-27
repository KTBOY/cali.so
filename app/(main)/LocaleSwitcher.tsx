'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import { Tooltip } from '~/components/ui/Tooltip'
import { type Locale } from '~/i18n/config'
import { setUserLocale } from '~/i18n/locale'

export function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('locale')
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  function toggleLocale() {
    const next: Locale = locale === 'zh' ? 'en' : 'zh'
    startTransition(async () => {
      await setUserLocale(next)
      router.refresh()
    })
  }

  return (
    <Tooltip.Provider disableHoverableContent>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={t('toggle')}
            disabled={isPending}
            className="group rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
            onClick={toggleLocale}
          >
            <span className="flex h-6 w-6 items-center justify-center text-sm font-medium text-zinc-500 transition group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
              {locale === 'zh' ? '中' : 'EN'}
            </span>
          </button>
        </Tooltip.Trigger>

        <AnimatePresence>
          {open && (
            <Tooltip.Portal forceMount>
              <Tooltip.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {t('toggle')}
                </motion.div>
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </AnimatePresence>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
