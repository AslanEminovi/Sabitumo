import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items, shipping, user_id, coupon_code, discount_amount = 0 } = await request.json()

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!shipping || !shipping.address || !shipping.city) {
      return NextResponse.json({ error: 'Shipping information required' }, { status: 400 })
    }

    // Calculate total amount
    let total_amount = 0
    const processedItems = []

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single()

      if (!product) {
        return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name_en}. Available: ${product.stock}` 
        }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      total_amount += itemTotal

      processedItems.push({
        product_id: item.product_id,
        product_name: product.name_en,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        selected_size: item.selected_size
      })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        status: 'pending',
        total_amount,
        currency: 'GEL',
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_postal_code: shipping.postal_code || '',
        shipping_country: shipping.country || 'Georgia',
        payment_status: 'pending',
        notes: shipping.notes || ''
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItemsWithOrderId = processedItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // Update product stock
    for (const item of items) {
      // First get current stock
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()
      
      if (product) {
        await supabase
          .from('products')
          .update({ 
            stock: Math.max(0, product.stock - item.quantity)
          })
          .eq('id', item.product_id)
      }
    }

    // Update coupon usage if applicable
    if (coupon_code && discount_amount > 0) {
      // Get current used count
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('code', coupon_code)
        .single()
      
      if (coupon) {
        await supabase
          .from('coupons')
          .update({ 
            used_count: coupon.used_count + 1
          })
          .eq('code', coupon_code)
      }
    }

    // Clear user's cart if user is logged in
    if (user_id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user_id)
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      total_amount,
      discount_amount,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
