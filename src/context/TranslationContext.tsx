'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { en } from '@/i18n/translations/en'
import { ka } from '@/i18n/translations/ka'
import { i18nConfig } from '@/i18n/config'

type Locale = 'en' | 'ka'
type TranslationKey = keyof typeof en
type NestedTranslationKey<T extends TranslationKey> = T extends keyof typeof en 
  ? typeof en[T] extends Record<string, any> 
    ? keyof typeof en[T] 
    : never 
  : never

interface TranslationContextType {
  locale: Locale
  changeLocale: (newLocale: Locale) => void
  t: <T extends TranslationKey>(
    key: T,
    nestedKey?: NestedTranslationKey<T>
  ) => string
  locales: readonly Locale[]
  localeNames: Record<string, string>
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>('ka')

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && i18nConfig.locales.includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

  const t = <T extends TranslationKey>(
    key: T,
    nestedKey?: NestedTranslationKey<T>
  ): string => {
    const translations = locale === 'en' ? en : ka
    
    if (nestedKey) {
      const section = translations[key] as Record<string, string>
      return section[nestedKey as string] || String(key)
    }
    
    const section = translations[key]
    if (typeof section === 'string') {
      return section
    }
    
    return String(key)
  }

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const value: TranslationContextType = {
    locale,
    changeLocale,
    t,
    locales: i18nConfig.locales as readonly Locale[],
    localeNames: i18nConfig.localeNames
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
