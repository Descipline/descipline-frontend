import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import AsyncStorage from '@react-native-async-storage/async-storage'

const REDIRECT_KEY = 'redirectAfterAuth'

export function useWalletGuard() {
  const { account, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Wait for auth loading to complete
    if (isLoading) return

    // Allowed paths that don't require wallet connection
    const allowedPaths = [
      '/',
      '/home',
      '/(tabs)/home',
      '/sign-in'
    ]

    const isAllowed = allowedPaths.some(path => pathname === path)

    // If on a protected page without wallet, redirect to sign-in
    if (!isAllowed && !account && !hasRedirected.current) {
      hasRedirected.current = true
      
      // Store current path for redirect after login
      if (pathname && pathname !== '/sign-in') {
        AsyncStorage.setItem(REDIRECT_KEY, pathname).catch(console.error)
      }
      
      console.log(`🔒 Wallet guard: Redirecting from ${pathname} to /sign-in`)
      router.replace('/sign-in')
    }

    // Reset redirect flag when account changes
    if (account) {
      hasRedirected.current = false
    }
  }, [account, isLoading, pathname, router])

  return { account, isLoading }
}

// Helper function to handle redirect after successful login
export async function handlePostLoginRedirect(router: any) {
  try {
    const redirectPath = await AsyncStorage.getItem(REDIRECT_KEY)
    
    if (redirectPath) {
      // Clear stored redirect path
      await AsyncStorage.removeItem(REDIRECT_KEY)
      console.log(`🔓 Redirecting to stored path: ${redirectPath}`)
      router.replace(redirectPath)
    } else {
      // Default redirect to challenges page
      console.log('🔓 No stored path, redirecting to challenges')
      router.replace('/(tabs)/challenges')
    }
  } catch (error) {
    console.error('Error handling post-login redirect:', error)
    // Fallback to challenges page
    router.replace('/(tabs)/challenges')
  }
}