/*
 * @Author: zlc
 * @Date: 2025-07-14 18:02:38
 * @LastEditTime: 2025-09-03 16:26:48
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\app\layout.tsx
 */
import './globals.css'
import './clerk.css'
import './prism.css'

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

import { ThemeProvider } from '~/app/(main)/ThemeProvider'
import { zhCN } from '~/lib/clerkLocalizations'
import { sansFont } from '~/lib/font'
import { seo } from '~/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('seo')

  return {
    metadataBase: seo.url,
    title: {
      template: '%s | Shu ke',
      default: t('title'),
    },
    description: t('description'),
    keywords: t('keywords'),
    manifest: '/site.webmanifest',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: {
        default: t('title'),
        template: '%s | Shu ke',
      },
      description: t('description'),
      siteName: 'Shu ke',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
      url: seo.url.href,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      types: {
        'application/rss+xml': [{ url: 'rss', title: t('rss') }],
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000212' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <ClerkProvider localization={locale === 'zh' ? zhCN : undefined}>
      <html
        lang={locale === 'zh' ? 'zh-CN' : 'en'}
        className={`${sansFont.variable} m-0 h-full p-0 font-sans antialiased`}
        suppressHydrationWarning
      >

        <body className="flex h-full flex-col">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
          <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function (error) {
                    console.error('Service Worker registration failed:', error)
                  })
                })
              }
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  )
}
