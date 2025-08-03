import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { Challenge } from '@/utils/descipline/types'
import { TransactionStep } from './ui/transaction-progress-modal'

interface StakeChallengeParams {
  challenge: Challenge
  onProgressUpdate: (step: TransactionStep, data?: any) => void
}

export function useStakeChallenge() {
  const connection = useConnection()
  const { account } = useAuth()
  const { signAndSendTransaction } = useMobileWallet()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!account) {
          throw new Error('Wallet not connected')
        }

        // Step 1: Preparing transaction
        onProgressUpdate(TransactionStep.PREPARING)
        
        // Build the actual stake transaction
        // Note: This is a placeholder transaction
        // Real implementation should use Descipline program stake instruction
        const transaction = new Transaction()
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Note: Using placeholder transfer instruction
        // Real implementation would call Descipline program stake function
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: account.publicKey, // Self transfer as demo
            lamports: 1000 // Small amount for demo
          })
        )

        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey

        // Step 2: Request wallet signature and send
        onProgressUpdate(TransactionStep.SIGNING)
        
        // Step 3: Send transaction
        onProgressUpdate(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)

        // Step 4: Wait for confirmation
        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')

        // Step 5: Success
        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, success: true }
      } catch (error) {
        console.error('Stake transaction failed:', error)
        onProgressUpdate(TransactionStep.ERROR, { error: error.message })
        throw error
      }
    }
  })
}

export function useClaimReward() {
  const connection = useConnection()
  const { account } = useAuth()
  const { signAndSendTransaction } = useMobileWallet()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!account) {
          throw new Error('Wallet not connected')
        }

        onProgressUpdate(TransactionStep.PREPARING)
        
        // Build claim transaction
        const transaction = new Transaction()
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Note: This is a placeholder claim instruction
        // Real implementation should use Descipline program claim instruction
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: account.publicKey,
            lamports: 1000
          })
        )

        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey

        onProgressUpdate(TransactionStep.SIGNING)
        onProgressUpdate(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)

        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')

        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, success: true }
      } catch (error) {
        console.error('Claim transaction failed:', error)
        onProgressUpdate(TransactionStep.ERROR, { error: error.message })
        throw error
      }
    }
  })
}