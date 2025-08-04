import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { Challenge } from '@/utils/descipline/types'
import { TransactionStep } from './ui/transaction-progress-modal'
import { buildStakeInstruction, buildClaimInstruction } from '@/utils/descipline/gill-transaction-builder'

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

        console.log('Staking challenge:', challenge.publicKey, 'with user:', account.publicKey.toString())

        // Step 1: Preparing transaction
        onProgressUpdate(TransactionStep.PREPARING)
        
        // Get latest blockhash with confirmed commitment
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
        
        // Parse challenge data
        const challengePublicKey = new PublicKey(challenge.publicKey)
        const stakeMintPublicKey = new PublicKey(challenge.stakeMint || (challenge.tokenAllowed === 'USDC' ? '4NQMuSBhVrqTh8FMv5AbHvADVwHSnxrHNERPdAFu5B8p' : 'So11111111111111111111111111111111111111112'))
        
        // Build stake instruction using Gill
        const stakeIx = await buildStakeInstruction({
          challenger: account.publicKey,
          challenge: challengePublicKey,
          stakeMint: stakeMintPublicKey,
        })

        // Build transaction
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey
        transaction.add(stakeIx)

        console.log('Stake transaction built with', transaction.instructions.length, 'instructions')

        // Step 2: Request wallet signature and send
        onProgressUpdate(TransactionStep.SIGNING)
        
        // Step 3: Send transaction
        onProgressUpdate(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)
        console.log('Stake transaction sent:', signature)

        // Step 4: Wait for confirmation
        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        const result = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')
        
        console.log('Stake transaction confirmation result:', result)

        if (result.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`)
        }

        // Step 5: Success
        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, success: true }
      } catch (error: any) {
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

        console.log('Claiming reward for challenge:', challenge.publicKey, 'with user:', account.publicKey.toString())

        onProgressUpdate(TransactionStep.PREPARING)
        
        // Get latest blockhash with confirmed commitment
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
        
        // Parse challenge data
        const challengePublicKey = new PublicKey(challenge.publicKey)
        const stakeMintPublicKey = new PublicKey(challenge.stakeMint || (challenge.tokenAllowed === 'USDC' ? '4NQMuSBhVrqTh8FMv5AbHvADVwHSnxrHNERPdAFu5B8p' : 'So11111111111111111111111111111111111111112'))
        
        // Build claim instruction using Gill
        const claimIx = await buildClaimInstruction({
          claimer: account.publicKey,
          challenge: challengePublicKey,
          stakeMint: stakeMintPublicKey,
          // TODO: Add merkle proof params when implemented
        })

        // Build transaction
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey
        transaction.add(claimIx)

        console.log('Claim transaction built with', transaction.instructions.length, 'instructions')

        onProgressUpdate(TransactionStep.SIGNING)
        onProgressUpdate(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)
        console.log('Claim transaction sent:', signature)

        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        const result = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')
        
        console.log('Claim transaction confirmation result:', result)

        if (result.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`)
        }

        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, success: true }
      } catch (error: any) {
        console.error('Claim transaction failed:', error)
        onProgressUpdate(TransactionStep.ERROR, { error: error.message })
        throw error
      }
    }
  })
}