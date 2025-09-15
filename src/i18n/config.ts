export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'ka'],
  localeNames: {
    en: 'English',
    ka: 'ქართული'
  }
} as const

export type Locale = keyof typeof i18nConfig.locales
export type LocaleName = keyof typeof i18nConfig.localeNames
