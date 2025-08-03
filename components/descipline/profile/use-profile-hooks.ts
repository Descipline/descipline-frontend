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
  const { data: allChallenges, isLoading: challengesLoading } = useGetChallengesWithGill()

  return useQuery({
    queryKey: ['userCreatedChallenges', account?.publicKey?.toString()],
    queryFn: () => {
      if (!account?.publicKey || !allChallenges) return []
      
      return allChallenges.filter(challenge => 
        challenge.initiator === account.publicKey.toString()
      )
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
    queryKey: ['userStats', createdQuery.data, participatedQuery.data],
    queryFn: (): UserStats => {
      const created = createdQuery.data || []
      const participated = participatedQuery.data || []
      
      return {
        totalCreated: created.length,
        totalParticipated: participated.length,
        totalWon: participated.filter(c => (c as any).userStatus === 'winner').length,
        totalEarned: 0, // TODO: Calculate from won challenges
      }
    },
    enabled: !createdQuery.isLoading && !participatedQuery.isLoading,
    staleTime: 30000,
  })
}