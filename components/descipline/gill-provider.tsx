/**
 * Gill-based Descipline Provider
 * Alternative to Anchor for React Native compatibility
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useConnection } from '@/components/solana/solana-provider'
import { 
  testGillConnection, 
  fetchChallengesWithGill, 
  getChallengeStatsWithGill,
  type GillChallengeData 
} from '@/utils/descipline/gill-reader'

interface GillDesciplineContextType {
  isConnected: boolean
  challenges: GillChallengeData[]
  stats: {
    totalChallenges: number
    activeChallenges: number
    totalReceipts: number
  }
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const GillDesciplineContext = createContext<GillDesciplineContextType>({
  isConnected: false,
  challenges: [],
  stats: {
    totalChallenges: 0,
    activeChallenges: 0,
    totalReceipts: 0
  },
  loading: false,
  error: null,
  refresh: async () => {}
})

export function GillDesciplineProvider({ children }: { children: React.ReactNode }) {
  console.log('🔧 GillDesciplineProvider ENTRY - Using Gill Library for React Native')
  
  const connection = useConnection()
  const [isConnected, setIsConnected] = useState(false)
  const [challenges, setChallenges] = useState<GillChallengeData[]>([])
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalReceipts: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test gill connection
  useEffect(() => {
    async function testConnection() {
      if (!connection) {
        console.log('❌ Gill Provider: No connection available')
        return
      }

      try {
        console.log('🔧 Testing gill connection...')
        setLoading(true)
        setError(null)
        
        const connected = await testGillConnection(connection)
        setIsConnected(connected)
        
        if (connected) {
          console.log('✅ Gill connection successful - loading data...')
          await loadData()
        } else {
          setError('Failed to connect with gill library')
        }
        
      } catch (error: any) {
        console.error('❌ Gill connection error:', error)
        setError(error.message || 'Unknown gill error')
        setIsConnected(false)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [connection])

  const loadData = async () => {
    if (!connection) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔧 Loading challenges and stats with gill...')
      
      // Load challenges and stats in parallel
      const [challengesData, statsData] = await Promise.all([
        fetchChallengesWithGill(connection),
        getChallengeStatsWithGill(connection)
      ])
      
      setChallenges(challengesData)
      setStats(statsData)
      
      console.log('✅ Gill data loaded successfully:', {
        challenges: challengesData.length,
        stats: statsData
      })
      
    } catch (error: any) {
      console.error('❌ Gill data loading error:', error)
      setError(error.message || 'Failed to load data with gill')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    console.log('🔧 Refreshing gill data...')
    await loadData()
  }

  const value: GillDesciplineContextType = {
    isConnected,
    challenges,
    stats,
    loading,
    error,
    refresh
  }

  return (
    <GillDesciplineContext.Provider value={value}>
      {children}
    </GillDesciplineContext.Provider>
  )
}

export function useGillDescipline() {
  const context = useContext(GillDesciplineContext)
  console.log('🎯 useGillDescipline called:', { 
    isConnected: context.isConnected,
    challengesCount: context.challenges.length,
    loading: context.loading,
    error: context.error
  })
  
  if (!context) {
    console.error('❌ useGillDescipline: No context found - not within GillDesciplineProvider')
    throw new Error('useGillDescipline must be used within GillDesciplineProvider')
  }
  
  return context
}

// Export both providers for comparison
export { GillDesciplineProvider as default, useGillDescipline as default as useDescipline }