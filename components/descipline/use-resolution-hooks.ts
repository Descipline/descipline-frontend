import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { desciplineKeys } from '@/utils/descipline/constants'

// Resolution 数据结构
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

// 从本地文件获取 resolution 数据
export function useGetResolution(challengeId: string) {
  return useQuery({
    queryKey: [...desciplineKeys.resolution(challengeId)],
    queryFn: async (): Promise<ResolutionData | null> => {
      if (!challengeId) return null
      
      console.log('🔍 Loading resolution data for challenge:', challengeId)
      
      try {
        // 尝试根据 challengeId 前8位查找对应的 resolution 文件
        const shortId = challengeId.slice(0, 8)
        
        // 在 React Native 中，我们需要直接 require 静态资源
        // 首先尝试加载已知的 resolution 文件
        try {
          const resolutionData = require('@/assets/resolutions/resolution-2HqUUkG6.json')
          
          // 检查是否匹配当前挑战
          if (resolutionData.challengePda === challengeId || 
              resolutionData.challengePda.startsWith(shortId)) {
            console.log('✅ Found matching resolution data:', resolutionData.challengeName)
            return resolutionData as ResolutionData
          }
        } catch (error) {
          console.log('📄 Resolution file not found for challenge:', shortId)
        }
        
        // 如果没有找到本地文件，尝试从链上获取（未来可以实现）
        console.log('⚠️ No local resolution found, challenge may not be resolved yet')
        return null
        
      } catch (error) {
        console.error('❌ Error loading resolution data:', error)
        return null
      }
    },
    enabled: !!challengeId,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    cacheTime: 10 * 60 * 1000, // 10分钟缓存
  })
}

// 获取用户的获奖证明
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

// 检查用户是否可以领奖
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
    
    // TODO: 这里可以添加更多检查
    // 1. 检查用户是否已经领取过奖励（查询链上 receipt 状态）
    // 2. 检查是否在领奖时间范围内
    // 3. 检查挑战状态是否为 RESOLVED
    
    return {
      canClaim: true,
      isLoading: false,
      reason: 'Ready to claim'
    }
  }, [resolution, resolutionLoading, isWinner, userAddress])
}

// 获取用户的奖励金额（基于 resolution 数据计算）
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
    
    // 根据 amigo 的计算逻辑：
    // 总奖励池 = 单人质押金额 × 总参与者数量
    // 个人奖励 = 总奖励池 ÷ 获奖者数量
    const stakeAmount = 2000000 // 从 resolution 可以推断，或者从链上获取
    const totalRewardPool = stakeAmount * resolution.totalParticipants
    const individualReward = totalRewardPool / resolution.winnerCount
    
    return {
      rewardAmount: individualReward,
      tokenSymbol: 'USDC', // 可以从链上或 resolution 数据获取
      decimals: 6
    }
  }, [resolution, isWinner])
}