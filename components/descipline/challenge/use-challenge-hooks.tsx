import { useMutation } from '@tanstack/react-query'
import { CreateChallengeFormData } from '@/utils/descipline/types'

export function useCreateChallenge() {
  return useMutation({
    mutationFn: async (formData: CreateChallengeFormData & { onProgress?: (step: string, message: string) => void }) => {
      console.log('useCreateChallenge called with:', formData)
      
      if (formData.onProgress) {
        formData.onProgress('creating_challenge', 'Creating challenge...')
      }
      
      // Challenge creation is not implemented yet
      // This should integrate with the actual Descipline program
      throw new Error('Challenge creation not implemented yet. Please check back later.')
    },
    onSuccess: (data) => {
      console.log('Challenge creation succeeded:', data)
    },
    onError: (error) => {
      console.error('Challenge creation failed:', error)
    },
  })
}