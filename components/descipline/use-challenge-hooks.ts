import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useDescipline } from './descipline-provider'
import { desciplineKeys } from '@/utils/descipline/constants'
import { Challenge, ChallengeWithDetails } from '@/utils/descipline/types'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useConnection } from '@/components/solana/solana-provider'

// 获取所有挑战
export function useGetChallenges() {
  const { program } = useDescipline()
  const connection = useConnection()

  return useQuery({
    queryKey: desciplineKeys.challenges(),
    queryFn: async () => {
      if (!program) throw new Error('Program not initialized')

      console.log('🔍 Fetching challenges...')
      console.log('📡 Program ID:', program.programId.toString())
      console.log('📡 Connection endpoint:', connection.rpcEndpoint)
      
      try {
        const challenges = await (program.account as any).challenge.all()
        console.log('✅ Found challenges:', challenges.length)
        
        if (challenges.length === 0) {
          console.log('⚠️ No challenges found on program:', program.programId.toString())
          return []
        }

        // 基础挑战数据转换
        const challengesWithBasicData = challenges.map((challenge: any) => {
          return {
            ...challenge.account,
            publicKey: challenge.publicKey,
            participantCount: 0, // TODO: 实现真实参与者计数
            participants: [], // TODO: 实现参与者列表
          } as ChallengeWithDetails
        })

        console.log('✅ Processed challenges:', challengesWithBasicData.length)
        return challengesWithBasicData
        
      } catch (error) {
        console.error('❌ Error fetching challenges:', error)
        throw error
      }
    },
    enabled: !!program && !!connection,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

// 获取单个挑战详情
export function useGetChallenge(challengeId: string | undefined) {
  const { program } = useDescipline()
  const connection = useConnection()

  return useQuery({
    queryKey: desciplineKeys.challenge(challengeId),
    queryFn: async () => {
      if (!program || !challengeId) throw new Error('Program or challenge ID not available')

      console.log('🔍 Fetching challenge details for:', challengeId)

      try {
        const challengePublicKey = new PublicKey(challengeId)
        const challenge = await program.account.challenge.fetch(challengePublicKey)
        
        console.log('✅ Fetched challenge:', challengeId)
        
        return {
          ...challenge,
          publicKey: challengePublicKey,
          participantCount: 0, // TODO: 实现真实参与者计数
          participants: [], // TODO: 实现参与者列表
        } as ChallengeWithDetails

      } catch (error) {
        console.error('❌ Error fetching challenge:', error)
        throw error
      }
    },
    enabled: !!program && !!challengeId,
    staleTime: 30000,
  })
}

// 测试基础连接
export function useTestConnection() {
  const { program } = useDescipline()
  const { account } = useWalletUi()
  const connection = useConnection()

  return useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      console.log('🧪 Testing Descipline connection...')
      
      const result = {
        hasProgram: !!program,
        hasWallet: !!account,
        hasConnection: !!connection,
        programId: program?.programId?.toString(),
        walletAddress: account?.publicKey?.toString(),
        endpoint: connection?.rpcEndpoint,
      }
      
      console.log('🧪 Connection test result:', result)
      return result
    },
    enabled: true,
    staleTime: 10000,
  })
}