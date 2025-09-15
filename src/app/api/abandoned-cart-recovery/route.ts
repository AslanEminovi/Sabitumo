import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This would typically be called by a cron job or scheduled function
export async function POST(request: NextRequest) {
  try {
    // Get abandoned carts that haven't been recovered and need reminders
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    const reminderCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago for second reminder

    const { data: abandonedCarts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .is('recovered_at', null)
      .lt('abandoned_at', cutoffTime.toISOString())
      .or(`reminder_sent_count.eq.0,and(reminder_sent_count.eq.1,last_reminder_sent.lt.${reminderCutoff.toISOString()})`)
      .limit(50) // Process in batches

    if (error) {
      console.error('Error fetching abandoned carts:', error)
      return NextResponse.json({ error: 'Failed to fetch abandoned carts' }, { status: 500 })
    }

    const emailsSent = []

    for (const cart of abandonedCarts || []) {
      try {
        // Prepare email data
        const emailData = {
          to: cart.email,
          subject: cart.reminder_sent_count === 0 
            ? 'You left something in your cart!' 
            : 'Still thinking about your cart?',
          template: cart.reminder_sent_count === 0 ? 'abandoned_cart_1' : 'abandoned_cart_2',
          data: {
            cart_items: cart.cart_data,
            total_amount: cart.total_amount,
            currency: cart.currency,
            recovery_link: `${process.env.NEXT_PUBLIC_SITE_URL}/cart?recovery=${cart.id}`,
            discount_code: cart.reminder_sent_count === 0 ? null : 'COMEBACK10' // Offer discount on second reminder
          }
        }

        // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
        // For now, we'll just log and update the database
        console.log('Would send email:', emailData)

        // Update the abandoned cart record
        await supabase
          .from('abandoned_carts')
          .update({
            reminder_sent_count: cart.reminder_sent_count + 1,
            last_reminder_sent: new Date().toISOString()
          })
          .eq('id', cart.id)

        emailsSent.push({
          cart_id: cart.id,
          email: cart.email,
          reminder_count: cart.reminder_sent_count + 1
        })

      } catch (emailError) {
        console.error(`Error processing cart ${cart.id}:`, emailError)
      }
    }

    return NextResponse.json({
      success: true,
      processed: abandonedCarts?.length || 0,
      emails_sent: emailsSent.length,
      details: emailsSent
    })

  } catch (error) {
    console.error('Abandoned cart recovery error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get abandoned cart recovery stats
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get abandoned carts statistics
    const { data: abandonedCarts, error: abandonedError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .gte('abandoned_at', startDate)

    if (abandonedError) {
      throw abandonedError
    }

    // Get recovered carts (carts that were abandoned but later had successful orders)
    const { data: recoveredCarts, error: recoveredError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .gte('abandoned_at', startDate)
      .not('recovered_at', 'is', null)

    if (recoveredError) {
      throw recoveredError
    }

    // Calculate statistics
    const totalAbandoned = abandonedCarts?.length || 0
    const totalRecovered = recoveredCarts?.length || 0
    const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0
    
    const totalAbandonedValue = abandonedCarts?.reduce((sum, cart) => sum + cart.total_amount, 0) || 0
    const totalRecoveredValue = recoveredCarts?.reduce((sum, cart) => sum + cart.total_amount, 0) || 0

    // Group by reminder count
    const reminderStats = {
      no_reminder: abandonedCarts?.filter(cart => cart.reminder_sent_count === 0).length || 0,
      one_reminder: abandonedCarts?.filter(cart => cart.reminder_sent_count === 1).length || 0,
      two_reminders: abandonedCarts?.filter(cart => cart.reminder_sent_count >= 2).length || 0,
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_abandoned: totalAbandoned,
        total_recovered: totalRecovered,
        recovery_rate: Math.round(recoveryRate * 100) / 100,
        abandoned_value: totalAbandonedValue,
        recovered_value: totalRecoveredValue,
        reminder_stats: reminderStats,
      },
      recent_abandoned: abandonedCarts?.slice(0, 10).map(cart => ({
        id: cart.id,
        email: cart.email,
        total_amount: cart.total_amount,
        abandoned_at: cart.abandoned_at,
        reminder_sent_count: cart.reminder_sent_count,
        items_count: cart.cart_data?.length || 0
      }))
    })

  } catch (error) {
    console.error('Error fetching abandoned cart stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
