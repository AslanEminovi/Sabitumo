import { supabase } from './supabase'

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void
  }
}

// Google Analytics tracking
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID'

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    })
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// E-commerce tracking
export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string,
  items: any[]
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    })
  }
}

export const trackAddToCart = (
  currency: string,
  value: number,
  items: any[]
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: currency,
      value: value,
      items: items,
    })
  }
}

export const trackViewItem = (
  currency: string,
  value: number,
  items: any[]
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: currency,
      value: value,
      items: items,
    })
  }
}

// Custom analytics for database storage
export const trackPageViewToDatabase = async (pagePath: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('page_views').insert({
      user_id: user?.id,
      page_path: pagePath,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

export const trackProductView = async (productId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('product_views').insert({
      user_id: user?.id,
      product_id: productId,
    })
  } catch (error) {
    console.error('Error tracking product view:', error)
  }
}

// Abandoned cart tracking
export const trackAbandonedCart = async (cartData: any[], totalAmount: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase.from('abandoned_carts').upsert({
      user_id: user.id,
      email: user.email,
      cart_data: cartData,
      total_amount: totalAmount,
      currency: 'GEL',
      abandoned_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })
  } catch (error) {
    console.error('Error tracking abandoned cart:', error)
  }
}

// Sales analytics functions
export const getSalesAnalytics = async (startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name_en,
            name_ka,
            category_id,
            brand_id
          )
        )
      `)
      .eq('payment_status', 'paid')

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Calculate analytics
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const totalOrders = orders?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      orders,
    }
  } catch (error) {
    console.error('Error fetching sales analytics:', error)
    return null
  }
}

export const getTopProducts = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products!inner (
          name_en,
          name_ka,
          price,
          images
        )
      `)
      .order('quantity', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Transform the data to flatten the products array to a single object
    const transformedData = data?.map(item => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products
    })) || []

    return transformedData
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  }
}
