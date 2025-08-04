import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { desciplineKeys } from '@/utils/descipline/constants'

// Resolution data structure
export interface ResolutionData {
  challengePda: string
  challengeName: string
  resolutionPda: string
  attestationPda: string
  strategy: string
  totalParticipants: number
  winners: string[]
  winnerCount: number
  merkleRoot: string
  merkleProofs: {
    address: string
    proof: string[]
  }[]
  resolutionTransaction: string
  resolvedAt: string
  resolvedBy: string
}

// Get resolution data from local files
export function useGetResolution(challengeId: string) {
  return useQuery({
    queryKey: [...desciplineKeys.resolution(challengeId)],
    queryFn: async (): Promise<ResolutionData | null> => {
      if (!challengeId) return null
      
      console.log('🔍 Loading resolution data for challenge:', challengeId)
      
      try {
        // Dynamically construct resolution file URL
        const resolutionUrl = `/assets/resolutions/resolution-${challengeId}.json`
        
        console.log('📁 Fetching resolution file:', resolutionUrl)
        
        // Use fetch to get resolution file
        const response = await fetch(resolutionUrl)
        
        if (!response.ok) {
          console.log('⚠️ Resolution file not found, challenge may not be resolved yet')
          return null
        }
        
        const resolutionData = await response.json() as ResolutionData
        
        console.log('✅ Successfully loaded resolution data for challenge:', resolutionData.challengeName)
        console.log('🏆 Winners:', resolutionData.winners.length)
        
        return resolutionData
        
      } catch (error) {
        console.error('❌ Error loading resolution data:', error)
        console.log('⚠️ This is normal if the challenge has not been resolved yet')
        return null
      }
    },
    enabled: !!challengeId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  })
}

// Get user's winner proof
export function useGetWinnerProof(challengeId: string, userAddress?: string) {
  const { data: resolution } = useGetResolution(challengeId)
  
  return useMemo(() => {
    if (!resolution || !userAddress) {
      return { 
        isWinner: false, 
        proof: null,
        merkleRoot: null 
      }
    }
    
    console.log('🔍 Checking winner proof for user:', userAddress)
    console.log('🏆 Winners in resolution:', resolution.winners)
    
    const isWinner = resolution.winners.includes(userAddress)
    const proofData = resolution.merkleProofs.find(p => p.address === userAddress)
    
    console.log(`✅ User ${userAddress} is winner: ${isWinner}`)
    
    return {
      isWinner,
      proof: proofData?.proof || null,
      merkleRoot: resolution.merkleRoot
    }
  }, [resolution, userAddress])
}

// Check if user can claim rewards
export function useCanUserClaim(challengeId: string, userAddress?: string) {
  const { data: resolution, isLoading: resolutionLoading } = useGetResolution(challengeId)
  const { isWinner } = useGetWinnerProof(challengeId, userAddress)
  
  return useMemo(() => {
    if (resolutionLoading) {
      return {
        canClaim: false,
        isLoading: true,
        reason: 'Loading resolution data...'
      }
    }
    
    if (!resolution) {
      return {
        canClaim: false,
        isLoading: false,
        reason: 'Challenge not resolved yet'
      }
    }
    
    if (!userAddress) {
      return {
        canClaim: false,
        isLoading: false,
        reason: 'Wallet not connected'
      }
    }
    
    if (!isWinner) {
      return {
        canClaim: false,
        isLoading: false,
        reason: 'Not a winner'
      }
    }
    
    // TODO: Additional checks can be added here:
    // 1. Check if user has already claimed rewards (query on-chain receipt status)
    // 2. Check if within claim time window
    // 3. Check if challenge status is RESOLVED
    
    return {
      canClaim: true,
      isLoading: false,
      reason: 'Ready to claim'
    }
  }, [resolution, resolutionLoading, isWinner, userAddress])
}

// Get user's reward amount (calculated based on resolution data)
export function useGetUserReward(challengeId: string, userAddress?: string) {
  const { data: resolution } = useGetResolution(challengeId)
  const { isWinner } = useGetWinnerProof(challengeId, userAddress)
  
  return useMemo(() => {
    if (!resolution || !isWinner) {
      return {
        rewardAmount: 0,
        tokenSymbol: 'USDC',
        decimals: 6
      }
    }
    
    // Calculation logic based on amigo:
    // Total reward pool = stake amount per person × total participants
    // Individual reward = total reward pool ÷ winner count
    const stakeAmount = 2000000 // Can be inferred from resolution or fetched from chain
    const totalRewardPool = stakeAmount * resolution.totalParticipants
    const individualReward = totalRewardPool / resolution.winnerCount
    
    return {
      rewardAmount: individualReward,
      tokenSymbol: 'USDC', // Can be fetched from chain or resolution data
      decimals: 6
    }
  }, [resolution, isWinner])
}