import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/cluster/cluster-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { 
  fetchChallengesWithGill, 
  fetchChallengeByIdWithGill,
  GillChallengeData,
  GillStats,
  getProgramStatsWithGill,
  checkUserParticipationWithGill,
  getChallengeParticipantsWithGill
} from '@/utils/descipline/gill-challenge-reader'

/**
 * Gill-based hook to fetch all challenges
 * Uses manual buffer parsing instead of Anchor to avoid React Native compatibility issues
 */
export function useGetChallengesWithGill() {
  const { selectedCluster } = useCluster()

  return useQuery({
    queryKey: ['gill-challenges', selectedCluster?.endpoint],
    queryFn: async () => {
      console.log('🔍 Fetching challenges with gill...')
      
      try {
        const challenges = await fetchChallengesWithGill(selectedCluster?.endpoint)
        console.log(`✅ Gill: Found ${challenges.length} challenges`)
        return challenges
        
      } catch (error) {
        console.error('❌ Gill: Error fetching challenges:', error)
        throw error
      }
    },
    enabled: !!selectedCluster?.endpoint,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Gill-based hook to fetch single challenge
 */
export function useGetChallengeWithGill(challengeId: string | undefined) {
  const { selectedCluster } = useCluster()

  return useQuery({
    queryKey: ['gill-challenge', challengeId, selectedCluster?.endpoint],
    queryFn: async () => {
      if (!challengeId) throw new Error('Challenge ID required')
      
      console.log('🔍 Gill: Fetching challenge details for:', challengeId)
      
      try {
        const challenge = await fetchChallengeByIdWithGill(challengeId, selectedCluster?.endpoint)
        if (!challenge) {
          throw new Error('Challenge not found')
        }
        
        console.log('✅ Gill: Fetched challenge:', challengeId)
        return challenge
        
      } catch (error) {
        console.error('❌ Gill: Error fetching challenge:', error)
        throw error
      }
    },
    enabled: !!challengeId && !!selectedCluster?.endpoint,
    staleTime: 30000,
  })
}

/**
 * Gill-based hook to get program statistics
 */
export function useGetProgramStatsWithGill() {
  const { selectedCluster } = useCluster()

  return useQuery({
    queryKey: ['gill-program-stats', selectedCluster?.endpoint],
    queryFn: async () => {
      console.log('📊 Gill: Fetching program stats...')
      
      try {
        const stats = await getProgramStatsWithGill(selectedCluster?.endpoint)
        console.log('✅ Gill: Program stats:', stats)
        return stats
        
      } catch (error) {
        console.error('❌ Gill: Error fetching program stats:', error)
        throw error
      }
    },
    enabled: !!selectedCluster?.endpoint,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  })
}

/**
 * Test gill connection and functionality
 */
export function useTestGillConnection() {
  const { selectedCluster } = useCluster()

  return useQuery({
    queryKey: ['gill-connection-test', selectedCluster?.endpoint],
    queryFn: async () => {
      console.log('🧪 Testing gill connection...')
      
      try {
        const stats = await getProgramStatsWithGill(selectedCluster?.endpoint)
        const challenges = await fetchChallengesWithGill(selectedCluster?.endpoint)
        
        const result = {
          success: true,
          endpoint: selectedCluster?.endpoint,
          totalChallenges: stats.totalChallenges,
          activeChallenges: stats.activeChallenges,
          totalReceipts: stats.totalReceipts,
          sampleChallenge: challenges[0] || null,
          error: null
        }
        
        console.log('🧪 Gill connection test result:', result)
        return result
        
      } catch (error) {
        console.error('❌ Gill connection test failed:', error)
        return {
          success: false,
          endpoint: selectedCluster?.endpoint,
          totalChallenges: 0,
          activeChallenges: 0,
          totalReceipts: 0,
          sampleChallenge: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },
    enabled: !!selectedCluster?.endpoint,
    staleTime: 30000,
    refetchInterval: 180000, // Refetch every 3 minutes
  })
}

/**
 * Hook to check if current user has participated in a challenge
 */
export function useCheckUserParticipationWithGill(challengeId: string) {
  const { selectedCluster } = useCluster()
  const { account } = useAuth()
  
  return useQuery({
    queryKey: ['gill-user-participation', challengeId, account?.publicKey?.toString(), selectedCluster?.endpoint],
    queryFn: async () => {
      if (!account?.publicKey) {
        return false
      }
      
      console.log('🔍 Checking user participation for challenge:', challengeId)
      
      try {
        const hasParticipated = await checkUserParticipationWithGill(
          challengeId,
          account.publicKey.toString(),
          selectedCluster?.endpoint
        )
        
        console.log('✅ User participation check result:', hasParticipated)
        return hasParticipated
        
      } catch (error) {
        console.error('❌ Failed to check user participation:', error)
        return false
      }
    },
    enabled: !!selectedCluster?.endpoint && !!challengeId && !!account?.publicKey,
    staleTime: 30000,
  })
}

/**
 * Hook to get challenge participants
 */
export function useGetChallengeParticipantsWithGill(challengeId: string, stakeAmount: string) {
  const { selectedCluster } = useCluster()
  
  return useQuery({
    queryKey: ['gill-challenge-participants', challengeId, selectedCluster?.endpoint],
    queryFn: async () => {
      console.log('🔍 Fetching participants for challenge:', challengeId)
      
      try {
        const participants = await getChallengeParticipantsWithGill(
          challengeId,
          stakeAmount,
          selectedCluster?.endpoint
        )
        
        console.log('✅ Found participants:', participants.length)
        return participants
        
      } catch (error) {
        console.error('❌ Failed to fetch participants:', error)
        return []
      }
    },
    enabled: !!selectedCluster?.endpoint && !!challengeId && !!stakeAmount,
    staleTime: 30000,
  })
}