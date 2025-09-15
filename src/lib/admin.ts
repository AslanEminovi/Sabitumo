'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Admin email - only this user can access admin features
const ADMIN_EMAIL = 'eminoviaslan@gmail.com'

export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email === ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL
}

// Hook for components to check admin status
export function useIsAdmin() {
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin()
        if (mounted) {
          setIsAdminUser(adminStatus)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        if (mounted) {
          setIsAdminUser(false)
          setLoading(false)
        }
      }
    }

    checkAdmin()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
        try {
          const adminStatus = await isAdmin()
          if (mounted) {
            setIsAdminUser(adminStatus)
          }
        } catch (error) {
          console.error('Error checking admin status on auth change:', error)
          if (mounted) {
            setIsAdminUser(false)
          }
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { isAdminUser, loading }
}
