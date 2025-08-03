import { useQuery } from '@tanstack/react-query'
import { useGetChallengesWithGill } from '../use-gill-challenge-hooks'
import { useAuth } from '@/components/auth/auth-provider'

export interface UserStats {
  totalCreated: number
  totalParticipated: number
  totalWon: number
  totalEarned: number
}

export function useUserCreatedChallenges() {
  const { account } = useAuth()
  const { data: allChallenges, isLoading: challengesLoading, error: challengesError } = useGetChallengesWithGill()

  return useQuery({
    queryKey: ['userCreatedChallenges', account?.publicKey?.toString(), allChallenges?.length],
    queryFn: () => {
      console.log('🔍 Profile: Running useUserCreatedChallenges queryFn')
      console.log('👤 Profile: Account:', account?.publicKey?.toString())
      console.log('📊 Profile: All challenges loaded:', allChallenges?.length || 0)
      console.log('⏳ Profile: Challenges loading:', challengesLoading)
      console.log('❌ Profile: Challenges error:', challengesError)
      
      if (!account?.publicKey || !allChallenges) {
        console.log('⚠️ Profile: Missing account or challenges data')
        return []
      }
      
      const userChallenges = allChallenges.filter(challenge => 
        challenge.initiator === account.publicKey?.toString()
      )
      
      console.log(`✅ Profile: Found ${userChallenges.length} created challenges for user`)
      console.log('📝 Profile: Created challenges:', userChallenges.map(c => ({ name: c.name, initiator: c.initiator })))
      
      return userChallenges
    },
    enabled: !!account?.publicKey && !!allChallenges && !challengesLoading,
    staleTime: 30000,
  })
}

export function useUserParticipatedChallenges() {
  const { account } = useAuth()
  
  return useQuery({
    queryKey: ['userParticipatedChallenges', account?.publicKey?.toString()],
    queryFn: async () => {
      if (!account?.publicKey) return []
      
      // TODO: Implement gill-based receipt reading for participated challenges
      // For now return empty array since we need to implement receipt reading
      return []
    },
    enabled: !!account?.publicKey,
    staleTime: 30000,
  })
}

export function useUserStats() {
  const createdQuery = useUserCreatedChallenges()
  const participatedQuery = useUserParticipatedChallenges()

  return useQuery({
    queryKey: ['userStats', createdQuery.data?.length, participatedQuery.data?.length],
    queryFn: (): UserStats => {
      console.log('📊 Profile: Running useUserStats queryFn')
      console.log('📈 Profile: Created query data:', createdQuery.data?.length || 0)
      console.log('📈 Profile: Participated query data:', participatedQuery.data?.length || 0)
      console.log('📈 Profile: Created query loading:', createdQuery.isLoading)
      console.log('📈 Profile: Participated query loading:', participatedQuery.isLoading)
      
      const created = createdQuery.data || []
      const participated = participatedQuery.data || []
      
      const stats = {
        totalCreated: created.length,
        totalParticipated: participated.length,
        totalWon: participated.filter(c => (c as any).userStatus === 'winner').length,
        totalEarned: 0, // TODO: Calculate from won challenges
      }
      
      console.log('✅ Profile: Generated stats:', stats)
      return stats
    },
    enabled: !createdQuery.isLoading && !participatedQuery.isLoading,
    staleTime: 30000,
  })
}