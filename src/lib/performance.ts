'use client'

import React from 'react'

// Performance monitoring and optimization utilities

// Cache implementation for client-side data
class PerformanceCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

export const performanceCache = new PerformanceCache()

// Debounce function for search and inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Preload images for better UX
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Preload critical images
export async function preloadCriticalImages(images: string[]) {
  const preloadPromises = images.slice(0, 5).map(preloadImage) // Only first 5
  await Promise.allSettled(preloadPromises)
}

// Performance observer for monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: { [key: string]: number[] } = {}

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = []
    }
    this.metrics[name].push(value)
    
    // Keep only last 100 measurements
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100)
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics[name]
    if (!values || values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  clearMetrics() {
    this.metrics = {}
  }
}

// Measure component render time
export function measureRenderTime(componentName: string) {
  return function<T extends React.ComponentType<any>>(WrappedComponent: T): T {
    const MeasuredComponent = (props: any) => {
      const startTime = performance.now()
      
      React.useEffect(() => {
        const endTime = performance.now()
        const renderTime = endTime - startTime
        PerformanceMonitor.getInstance().recordMetric(`render_${componentName}`, renderTime)
      })

      return React.createElement(WrappedComponent, props)
    }

    MeasuredComponent.displayName = `Measured(${componentName})`
    return MeasuredComponent as T
  }
}

// Optimize heavy computations with memoization
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Batch API calls for better performance
export class APIBatcher {
  private batches: { [key: string]: any[] } = {}
  private timeouts: { [key: string]: NodeJS.Timeout } = {}
  private readonly BATCH_DELAY = 50 // ms

  batch<T>(key: string, item: T, processor: (items: T[]) => Promise<any>) {
    if (!this.batches[key]) {
      this.batches[key] = []
    }
    
    this.batches[key].push(item)
    
    // Clear existing timeout
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key])
    }
    
    // Set new timeout
    this.timeouts[key] = setTimeout(async () => {
      const items = this.batches[key]
      this.batches[key] = []
      delete this.timeouts[key]
      
      if (items.length > 0) {
        await processor(items)
      }
    }, this.BATCH_DELAY)
  }
}

export const apiBatcher = new APIBatcher()

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// Optimize scroll performance
export function optimizeScroll(element: HTMLElement, callback: () => void) {
  let ticking = false

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback()
        ticking = false
      })
      ticking = true
    }
  }

  element.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    element.removeEventListener('scroll', handleScroll)
  }
}

// Bundle analyzer utility
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:')
    console.log('Window object size:', JSON.stringify(window).length)
    console.log('Document size:', document.documentElement.outerHTML.length)
    console.log('Scripts count:', document.scripts.length)
    console.log('Stylesheets count:', document.styleSheets.length)
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string, 
  width: number, 
  height: number, 
  quality: number = 75
): string {
  // For Supabase storage or CDN optimization
  if (src.includes('supabase')) {
    return `${src}?width=${width}&height=${height}&quality=${quality}&format=webp`
  }
  
  return src
}

// Critical resource hints
export function addResourceHints() {
  if (typeof document === 'undefined') return

  // DNS prefetch for external domains
  const prefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'supabase.co'
  ]

  prefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = `//${domain}`
    document.head.appendChild(link)
  })

  // Preconnect to critical origins
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://supabase.co'
  ]

  preconnectOrigins.forEach(origin => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Initialize performance optimizations
export function initializePerformance() {
  if (typeof window !== 'undefined') {
    // Add resource hints
    addResourceHints()
    
    // Register service worker
    registerServiceWorker()
    
    // Clear cache periodically
    setInterval(() => {
      performanceCache.clear()
    }, 30 * 60 * 1000) // Every 30 minutes
    
    // Bundle analysis in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(analyzeBundleSize, 2000)
    }
  }
}
