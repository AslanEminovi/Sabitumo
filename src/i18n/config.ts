export const i18nConfig = {
  defaultLocale: 'ka',
  locales: ['ka', 'en'],
  localeNames: {
    ka: 'ქართული',
    en: 'English'
  }
} as const

export type Locale = keyof typeof i18nConfig.locales
export type LocaleName = keyof typeof i18nConfig.localeNames
