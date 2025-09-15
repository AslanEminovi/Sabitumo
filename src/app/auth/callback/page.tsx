'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...')
        console.log('Current URL:', window.location.href)
        console.log('URL hash:', window.location.hash)
        console.log('URL search:', window.location.search)
        
        // Wait a moment for the OAuth callback to be processed
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get the current session
        const { data, error } = await supabase.auth.getSession()
        
        console.log('Session data:', data)
        console.log('Session error:', error)
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (data.session?.user) {
          const user = data.session.user
          console.log('User authenticated:', user.email)
          console.log('User metadata:', user.user_metadata)
          console.log('App metadata:', user.app_metadata)
          
          // Handle Google OAuth user data if needed
          if (user.app_metadata?.provider === 'google' && user.user_metadata) {
            try {
              const googleData = {
                first_name: user.user_metadata.given_name || user.user_metadata.first_name || '',
                last_name: user.user_metadata.family_name || user.user_metadata.last_name || '',
                email: user.user_metadata.email || user.email || '',
                avatar_url: user.user_metadata.picture || user.user_metadata.avatar_url || '',
                phone: user.user_metadata.phone || '',
                address: user.user_metadata.address || '',
                city: user.user_metadata.city || '',
                country: user.user_metadata.country || 'Georgia'
              }

              console.log('Updating user metadata with Google data:', googleData)
              // Update user metadata with Google data
              await supabase.auth.updateUser({ data: googleData })
            } catch (updateError) {
              console.error('Error updating user metadata:', updateError)
              // Continue with auth even if metadata update fails
            }
          }

          // Redirect to home page
          console.log('Redirecting to home page...')
          router.push('/')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth callback failed:', error)
        router.push('/auth/login?error=auth_failed')
      }
    }

    // Handle the callback immediately
    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Completing sign in...
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we complete your authentication.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Debug Info:</strong> Check the browser console for detailed logs about the authentication process.
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go to Home Page
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
