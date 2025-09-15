import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavbarNew as Navbar } from '@/components/NavbarNew'
import { Footer } from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import { TranslationProvider } from '@/context/TranslationContext'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Sabitumo - Premium Knives & Tactical Gear | საბითუმო',
    template: '%s | Sabitumo'
  },
  description: 'Premium knives, tactical gear, and survival tools. Wholesale prices for retailers. High-quality products from top brands like LOWA, Cold Steel, Gerber, and more. Based in Tbilisi, Georgia.',
  keywords: ['knives', 'tactical gear', 'survival tools', 'wholesale', 'Georgia', 'Tbilisi', 'LOWA', 'Cold Steel', 'Gerber', 'tactical equipment'],
  authors: [{ name: 'Sabitumo' }],
  creator: 'Sabitumo',
  publisher: 'Sabitumo',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png', 
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ka_GE',
    url: 'https://sabitumo.ge',
    siteName: 'Sabitumo',
    title: 'Sabitumo - Premium Knives & Tactical Gear',
    description: 'Premium knives, tactical gear, and survival tools. Wholesale prices for retailers.',
    images: [
      {
        url: '/banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Sabitumo - Premium Knives & Tactical Gear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sabitumo',
    creator: '@sabitumo',
    title: 'Sabitumo - Premium Knives & Tactical Gear',
    description: 'Premium knives, tactical gear, and survival tools. Wholesale prices for retailers.',
    images: ['/banner.jpg'],
  },
  alternates: {
    canonical: 'https://sabitumo.ge',
    languages: {
      'en-US': 'https://sabitumo.ge/en',
      'ka-GE': 'https://sabitumo.ge/ka',
    },
  },
  category: 'ecommerce',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Sabitumo",
              "alternateName": "საბითუმო",
              "description": "Premium knives, tactical gear, and survival tools wholesale store",
              "url": "https://sabitumo.ge",
              "logo": "https://sabitumo.ge/sabitumo1.png",
              "image": "https://sabitumo.ge/banner.jpg",
              "telephone": "+995 599 42 00 23",
              "email": "info@sabitumo.ge",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Tbilisi",
                "addressLocality": "Tbilisi",
                "addressCountry": "GE"
              },
              "sameAs": [
                "https://facebook.com/sabitumo",
                "https://instagram.com/sabitumo"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Tactical Gear and Knives",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "Knives",
                    "itemListElement": []
                  },
                  {
                    "@type": "OfferCatalog", 
                    "name": "Tactical Gear",
                    "itemListElement": []
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
        
        <TranslationProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
