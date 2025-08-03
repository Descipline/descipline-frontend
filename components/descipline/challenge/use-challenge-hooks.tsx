import { useMutation } from '@tanstack/react-query'
import { CreateChallengeFormData } from '@/utils/descipline/types'

export function useCreateChallenge() {
  return useMutation({
    mutationFn: async (formData: CreateChallengeFormData & { onProgress?: (step: string, message: string) => void }) => {
      console.log('useCreateChallenge called with:', formData)
      
      // TODO: Implement actual challenge creation logic using Anchor or Web3.js
      // For now, simulate the creation process
      
      if (formData.onProgress) {
        formData.onProgress('creating_challenge', 'Creating challenge...')
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock successful result
      const result = {
        challengePda: 'mock-challenge-pda-address',
        signature: 'mock-transaction-signature',
        challengeData: {
          name: formData.name,
          tokenType: formData.tokenType,
          stakeAmount: formData.stakeAmount,
          fee: formData.fee,
          stakeEndAt: formData.stakeEndAt,
          claimStartFrom: formData.claimStartFrom,
        }
      }
      
      console.log('Challenge created successfully:', result)
      return result
    },
    onSuccess: (data) => {
      console.log('Challenge creation succeeded:', data)
    },
    onError: (error) => {
      console.error('Challenge creation failed:', error)
    },
  })
}