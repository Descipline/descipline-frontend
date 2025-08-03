import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useMobileWallet } from '@/components/solana/solana-provider'
import { Challenge } from '@/utils/descipline/types'
import { TransactionStep } from './ui/transaction-progress-modal'

interface StakeChallengeParams {
  challenge: Challenge
  onProgressUpdate: (step: TransactionStep, data?: any) => void
}

export function useStakeChallenge() {
  const connection = useConnection()
  const { selectedAccount, signAndSendTransactions } = useMobileWallet()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!selectedAccount) {
          throw new Error('Wallet not connected')
        }

        // Step 1: Preparing transaction
        onProgressUpdate(TransactionStep.PREPARING)
        
        // Build the actual stake transaction
        // For now, we'll create a simple transfer as a placeholder
        // TODO: Replace with actual Descipline program stake instruction
        const transaction = new Transaction()
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Add a simple memo instruction as placeholder
        // In real implementation, this would be the stake instruction
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: selectedAccount.publicKey,
            toPubkey: selectedAccount.publicKey, // Self transfer as demo
            lamports: 1000 // Small amount for demo
          })
        )

        transaction.recentBlockhash = blockhash
        transaction.feePayer = selectedAccount.publicKey

        // Step 2: Request wallet signature and send
        onProgressUpdate(TransactionStep.SIGNING)
        
        // Step 3: Send transaction
        onProgressUpdate(TransactionStep.SENDING)
        
        const signatures = await signAndSendTransactions({
          transactions: [transaction]
        })
        
        const signature = signatures[0]

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
  const { selectedAccount, signAndSendTransactions } = useMobileWallet()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!selectedAccount) {
          throw new Error('Wallet not connected')
        }

        onProgressUpdate(TransactionStep.PREPARING)
        
        // Build claim transaction
        const transaction = new Transaction()
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Add claim instruction (placeholder)
        // TODO: Replace with actual Descipline program claim instruction
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: selectedAccount.publicKey,
            toPubkey: selectedAccount.publicKey,
            lamports: 1000
          })
        )

        transaction.recentBlockhash = blockhash
        transaction.feePayer = selectedAccount.publicKey

        onProgressUpdate(TransactionStep.SIGNING)
        onProgressUpdate(TransactionStep.SENDING)
        
        const signatures = await signAndSendTransactions({
          transactions: [transaction]
        })
        
        const signature = signatures[0]

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