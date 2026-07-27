'use server'

import { cookies } from 'next/headers'

import {
  defaultLocale,
  type Locale,
  LOCALE_COOKIE_NAME,
  locales,
} from '~/i18n/config'

export async function getUserLocale(): Promise<Locale> {
  const value = cookies().get(LOCALE_COOKIE_NAME)?.value
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale
}

export async function setUserLocale(locale: Locale) {
  cookies().set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}
