import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { CreateChallengeFormData } from '@/utils/descipline/types'
import { TransactionStep } from '../ui/transaction-progress-modal'

interface CreateChallengeParams extends CreateChallengeFormData {
  onProgress?: (step: TransactionStep, data?: any) => void
}

export function useCreateChallenge() {
  const connection = useConnection()
  const { account } = useAuth()
  const { signAndSendTransaction } = useMobileWallet()

  return useMutation({
    mutationFn: async (params: CreateChallengeParams) => {
      try {
        console.log('Creating challenge with params:', params)
        
        if (!account) {
          throw new Error('Wallet not connected')
        }

        const { onProgress, ...formData } = params

        // Step 1: Preparing transaction
        onProgress?.(TransactionStep.PREPARING)
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Build the create challenge transaction
        // Note: This is a placeholder implementation
        // Real implementation should use Descipline program create_challenge instruction
        const transaction = new Transaction()
        
        // Placeholder transaction - in real implementation this would be:
        // 1. Create challenge account
        // 2. Initialize challenge with provided parameters
        // 3. Handle token wrapping if needed (SOL -> wSOL)
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: account.publicKey,
            lamports: 5000 // Demo fee for challenge creation
          })
        )

        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey

        // Step 2: Request wallet signature and send
        onProgress?.(TransactionStep.SIGNING)
        onProgress?.(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)
        
        console.log('Challenge creation transaction sent:', signature)
        
        // Step 3: Wait for confirmation
        onProgress?.(TransactionStep.CONFIRMING, { signature })
        
        // Confirm transaction
        const result = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')

        if (result.value.err) {
          throw new Error(`Transaction failed: ${result.value.err}`)
        }

        // Step 4: Success
        onProgress?.(TransactionStep.SUCCESS, { signature })
        
        // Generate a mock challenge ID for demo
        const challengeId = new PublicKey(signature).toString()
        
        return {
          signature,
          challengeId,
          formData,
          transactionHash: signature
        }
        
      } catch (error: any) {
        console.error('Challenge creation failed:', error)
        params.onProgress?.(TransactionStep.ERROR, { error: error.message })
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Challenge creation succeeded:', data)
    },
    onError: (error) => {
      console.error('Challenge creation failed:', error)
    },
  })
}