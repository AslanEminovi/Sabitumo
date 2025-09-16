'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

// Cache for frequently accessed data
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

const CACHE_TTL = {
  USER_ANALYTICS: 5 * 60 * 1000, // 5 minutes
  DASHBOARD_STATS: 2 * 60 * 1000, // 2 minutes
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  ORDERS: 1 * 60 * 1000, // 1 minute
}

function getCachedData(key: string) {
  const cached = queryCache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any, ttl: number) {
  queryCache.set(key, { data, timestamp: Date.now(), ttl })
}

// Optimized hook for user analytics with caching
export function useOptimizedUserAnalytics(userId: string | null, period: string = '6months') {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `user_analytics_${userId}_${period}`

  const fetchData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Optimized query using the database function
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_user_order_summary', {
          p_user_id: userId,
          p_days: period === '3months' ? 90 : period === '6months' ? 180 : period === '1year' ? 365 : 365
        })

      if (summaryError) throw summaryError

      // Get monthly trends using optimized function
      const { data: trends, error: trendsError } = await supabase
        .rpc('get_monthly_spending_trends', {
          p_user_id: userId,
          p_months: period === '3months' ? 3 : period === '6months' ? 6 : period === '1year' ? 12 : 6
        })

      if (trendsError) throw trendsError

      // Get top categories (optimized with limits)
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          order_items (
            quantity,
            unit_price,
            products!inner (
              categories!inner (
                name_en,
                name_ka
              )
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .limit(50) // Limit to last 50 orders for categories

      // Process categories efficiently
      const categoryStats: { [key: string]: { count: number, spending: number, name_en: string, name_ka: string } } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (item.products?.categories) {
            const category = item.products.categories
            const key = category.name_en
            if (!categoryStats[key]) {
              categoryStats[key] = {
                count: 0,
                spending: 0,
                name_en: category.name_en,
                name_ka: category.name_ka
              }
            }
            categoryStats[key].count += item.quantity
            categoryStats[key].spending += item.unit_price * item.quantity
          }
        })
      })

      const topCategories = Object.values(categoryStats)
        .sort((a, b) => b.spending - a.spending)
        .slice(0, 5)

      const result = {
        ...summary[0],
        monthlyTrends: trends || [],
        topCategories
      }

      // Cache the result
      setCachedData(cacheKey, result, CACHE_TTL.USER_ANALYTICS)
      setData(result)

    } catch (err) {
      console.error('Error fetching user analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, period, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Optimized hook for dashboard data with minimal queries
export function useOptimizedDashboard(userId: string | null) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `dashboard_${userId}`

  const fetchData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Single optimized query for recent orders with computed stats
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordersError) throw ordersError

      // Calculate stats in memory (faster than multiple DB queries)
      const stats = {
        totalOrders: recentOrders?.length || 0,
        totalSpent: recentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        averageOrderValue: 0,
        recentOrders: recentOrders?.slice(0, 5) || []
      }

      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalSpent / stats.totalOrders
      }

      // Cache the result
      setCachedData(cacheKey, stats, CACHE_TTL.DASHBOARD_STATS)
      setData(stats)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Optimized products hook with pagination and caching
export function useOptimizedProducts(page: number = 1, limit: number = 20, category?: string) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const cacheKey = `products_${page}_${limit}_${category || 'all'}`

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData.products)
        setHasMore(cachedData.hasMore)
        setLoading(false)
        return
      }

      let query = supabase
        .from('products')
        .select(`
          id,
          name_en,
          name_ka,
          price,
          images,
          stock,
          categories (
            name_en,
            name_ka
          )
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (category) {
        query = query.eq('category_id', category)
      }

      const { data: products, error: productsError, count } = await query

      if (productsError) throw productsError

      const result = {
        products: products || [],
        hasMore: count ? count > page * limit : false
      }

      // Cache the result
      setCachedData(cacheKey, result, CACHE_TTL.PRODUCTS)
      setData(result.products)
      setHasMore(result.hasMore)

    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, limit, category, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, hasMore, refetch: fetchData }
}

// Optimized admin analytics with materialized views
export function useOptimizedAdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = 'admin_analytics'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Use materialized views for better performance
      const [dashboardStats, productStats, recentOrders] = await Promise.all([
        supabase.from('mv_dashboard_stats').select('*').order('day', { ascending: false }).limit(30),
        supabase.from('mv_product_stats').select('*').single(),
        supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            order_items (
              quantity,
              products (
                name_en,
                name_ka
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      if (dashboardStats.error) throw dashboardStats.error
      if (productStats.error) throw productStats.error
      if (recentOrders.error) throw recentOrders.error

      const result = {
        dashboardStats: dashboardStats.data || [],
        productStats: productStats.data || {},
        recentOrders: recentOrders.data || []
      }

      // Cache the result
      setCachedData(cacheKey, result, CACHE_TTL.DASHBOARD_STATS)
      setData(result)

    } catch (err) {
      console.error('Error fetching admin analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Debounced search hook for better performance
export function useDebouncedSearch(searchTerm: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay])

  return debouncedValue
}

// Memory cleanup utility
export function clearQueryCache() {
  queryCache.clear()
}

// Prefetch utility for critical data
export function prefetchCriticalData(userId: string) {
  // Prefetch dashboard data
  setTimeout(() => {
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setCachedData(`dashboard_${userId}`, { recentOrders: data }, CACHE_TTL.DASHBOARD_STATS)
        }
      })
  }, 100)

  // Prefetch products
  setTimeout(() => {
    supabase
      .from('products')
      .select(`
        id,
        name_en,
        name_ka,
        price,
        images,
        categories (name_en, name_ka)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setCachedData('products_1_20_all', { products: data, hasMore: true }, CACHE_TTL.PRODUCTS)
        }
      })
  }, 200)
}
