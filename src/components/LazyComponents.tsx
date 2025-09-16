'use client'

import dynamic from 'next/dynamic'
import React, { Suspense, useEffect, useRef, useState } from 'react'

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
)

const LoadingCard = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
)

// Lazy load heavy components for better performance
export const LazyAIProductAnalysis = dynamic(
  () => import('./AIProductAnalysis'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Only load on client side
  }
)

export const LazyImageUpload = dynamic(
  () => import('./ImageUpload').then(mod => ({ default: mod.ImageUpload })),
  {
    loading: () => <LoadingCard />,
    ssr: false,
  }
)

export const LazyBrandsDropdown = dynamic(
  () => import('./BrandsDropdown'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // Keep SSR for SEO
  }
)

// Lazy load analytics components (placeholder for future charts)
export const LazyAnalyticsChart = dynamic(
  () => Promise.resolve(() => <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">Chart Component</div>),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse"></div>,
    ssr: false,
  }
)

// Lazy load admin components
export const LazyAdminPanel = dynamic(
  () => import('../app/admin/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Performance-optimized component wrapper
export function OptimizedSuspense({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// Intersection Observer hook for lazy loading on scroll
export function useLazyLoad() {
  
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before visible
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Lazy load wrapper component
export function LazyLoadWrapper({ 
  children, 
  height = '200px',
  className = ''
}: { 
  children: React.ReactNode
  height?: string
  className?: string
}) {
  const { ref, isVisible } = useLazyLoad()

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      {isVisible ? children : <LoadingCard />}
    </div>
  )
}
