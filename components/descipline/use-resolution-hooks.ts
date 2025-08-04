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

// Resolution file resolver - maps challengeId to require() calls
const getResolutionData = (challengeId: string): ResolutionData | null => {
  try {
    console.log('🔍 Attempting to load resolution for challengeId:', challengeId)
    
    // Known resolution files - add new ones here as they are created
    // Note: These are for the new contract deployment (Program ID: GYvSKR5kzDnf78iARutLVewr77ra88JZrdHuGowKuQmS)
    const resolutions: Record<string, any> = {
      // Add new resolution files here when they are created for the new contract
    }
    
    const resolutionData = resolutions[challengeId]
    
    if (resolutionData) {
      console.log('✅ Successfully loaded resolution data!')
      console.log('📋 Challenge Name:', resolutionData.challengeName)
      console.log('👥 Total Participants:', resolutionData.totalParticipants)
      console.log('🏆 Winner Count:', resolutionData.winnerCount)
      console.log('🎯 Winners List:', resolutionData.winners)
      console.log('🌳 Merkle Root:', resolutionData.merkleRoot)
      return resolutionData as ResolutionData
    } else {
      console.log('⚠️ No resolution data found for challenge:', challengeId)
      return null
    }
  } catch (error) {
    console.error('❌ Error loading resolution data:', error)
    return null
  }
}

// Get resolution data from local files
export function useGetResolution(challengeId: string) {
  return useQuery({
    queryKey: [...desciplineKeys.resolution(challengeId)],
    queryFn: async (): Promise<ResolutionData | null> => {
      if (!challengeId) return null
      
      console.log('🔍 Loading resolution data for challenge:', challengeId)
      
      // First try the require() method for known files
      const staticData = getResolutionData(challengeId)
      if (staticData) {
        return staticData
      }
      
      // Fallback to fetch method (may not work in React Native but worth trying)
      try {
        const resolutionUrl = `/assets/resolutions/resolution-${challengeId}.json`
        console.log('📁 Fallback: Attempting to fetch resolution file:', resolutionUrl)
        
        const response = await fetch(resolutionUrl)
        console.log('📡 Fetch response status:', response.status, response.statusText)
        
        if (!response.ok) {
          console.log('⚠️ Resolution file not found (HTTP', response.status, '), challenge may not be resolved yet')
          return null
        }
        
        const resolutionData = await response.json() as ResolutionData
        
        console.log('✅ Successfully loaded resolution data via fetch!')
        console.log('📋 Challenge Name:', resolutionData.challengeName)
        console.log('👥 Total Participants:', resolutionData.totalParticipants)
        console.log('🏆 Winner Count:', resolutionData.winnerCount)
        console.log('🎯 Winners List:', resolutionData.winners)
        console.log('🌳 Merkle Root:', resolutionData.merkleRoot)
        
        return resolutionData
        
      } catch (error) {
        console.error('❌ Both require() and fetch() methods failed:', error)
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
        merkleRoot: null,
        winnerIndex: -1
      }
    }
    
    console.log('🔍 Checking winner proof for user:', userAddress)
    console.log('🏆 Winners in resolution:', resolution.winners)
    
    const isWinner = resolution.winners.includes(userAddress)
    const winnerIndex = resolution.winners.indexOf(userAddress)
    const proofData = resolution.merkleProofs.find(p => p.address === userAddress)
    
    console.log('🎯 Winner Check Results:')
    console.log('   - User Address:', userAddress)
    console.log('   - Is Winner:', isWinner)
    console.log('   - Winner Index:', winnerIndex)
    console.log('   - Has Proof Data:', !!proofData)
    console.log('   - Proof Length:', proofData?.proof?.length || 0)
    console.log('   - Merkle Root:', resolution.merkleRoot)
    
    return {
      isWinner,
      proof: proofData?.proof || null,
      merkleRoot: resolution.merkleRoot,
      winnerIndex: winnerIndex >= 0 ? winnerIndex : -1
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

// Get user's reward amount (calculated based on resolution data and challenge stake amount)
export function useGetUserReward(challengeId: string, userAddress?: string, challengeStakeAmount?: number) {
  const { data: resolution } = useGetResolution(challengeId)
  const { isWinner } = useGetWinnerProof(challengeId, userAddress)
  
  return useMemo(() => {
    if (!resolution || !isWinner || !challengeStakeAmount) {
      return {
        rewardAmount: 0,
        tokenSymbol: 'USDC',
        decimals: 6
      }
    }
    
    // Test phase calculation logic:
    // Total reward pool = challenge.stakeAmount × totalParticipants from resolution JSON
    // Individual reward = total reward pool ÷ winner count from resolution JSON
    // Example: 2 USDC × 3 participants = 6 USDC total pool
    // 6 USDC ÷ 2 winners = 3 USDC per winner
    const totalRewardPool = challengeStakeAmount * resolution.totalParticipants  
    const individualReward = totalRewardPool / resolution.winnerCount
    
    console.log('💰 Reward Calculation:', {
      challengeStakeAmount,
      totalParticipants: resolution.totalParticipants,
      winnerCount: resolution.winnerCount,
      totalRewardPool,
      individualReward,
      example: `${challengeStakeAmount / 1000000} USDC × ${resolution.totalParticipants} = ${totalRewardPool / 1000000} USDC total, ÷ ${resolution.winnerCount} = ${individualReward / 1000000} USDC per winner`
    })
    
    return {
      rewardAmount: individualReward,
      tokenSymbol: 'USDC', // Can be fetched from chain or resolution data
      decimals: 6
    }
  }, [resolution, isWinner, challengeStakeAmount])
}