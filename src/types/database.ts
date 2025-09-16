export interface Product {
  id: string
  name_en: string
  name_ka?: string
  description_en: string
  description_ka?: string
  price: number
  currency: string
  category_id?: string
  category?: string
  subcategory?: string
  images: string[]
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
  min_order_quantity?: number
  brand_id?: string
  tags?: string[]
  sku?: string
  weight?: number
  dimensions?: string
  material?: string
  color?: string
  is_featured: boolean
  sizes?: any[]
  is_new_arrival: boolean
  is_bestseller: boolean
  slug_en?: string
  slug_ka?: string
  meta_title_en?: string
  meta_title_ka?: string
  meta_description_en?: string
  meta_description_ka?: string
  brands?: {
    id: string
    name: string
    slug: string
    logo?: string
  }
  categories?: {
    id: string
    name_en: string
    name_ka: string
    slug: string
  }
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  language: 'en' | 'ka'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  currency: string
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
  payment_status: 'pending' | 'paid' | 'failed'
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Category {
  id: string
  name_en: string
  name_ka: string
  slug: string
  description_en?: string
  description_ka?: string
  image?: string
  is_active: boolean
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description_en?: string
  description_ka?: string
  logo?: string
  website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: 'admin' | 'super_admin' | 'moderator'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_size?: string
  created_at: string
  updated_at: string
  product?: Product
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  title?: string
  comment?: string
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  user?: Pick<User, 'first_name' | 'last_name'>
}

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_amount: number
  maximum_discount?: number
  valid_from: string
  valid_until: string
  usage_limit?: number
  used_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AbandonedCart {
  id: string
  user_id: string
  email: string
  cart_data: any
  total_amount: number
  currency: string
  abandoned_at: string
  recovered_at?: string
  reminder_sent_count: number
  last_reminder_sent?: string
}

export interface PageView {
  id: string
  user_id?: string
  session_id?: string
  page_path: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  country?: string
  device_type?: string
  created_at: string
}

export interface ProductView {
  id: string
  user_id?: string
  product_id: string
  session_id?: string
  ip_address?: string
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  first_name?: string
  language: 'en' | 'ka'
  is_active: boolean
  subscribed_at: string
  unsubscribed_at?: string
}
