import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js'
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
        
        // Get latest blockhash - use confirmed like create challenge  
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
        
        // Parse challenge data
        const challengePublicKey = new PublicKey(challenge.publicKey)
        const stakeMintPublicKey = new PublicKey(challenge.stakeMint || (challenge.tokenAllowed === 'USDC' ? '4NQMuSBhVrqTh8FMv5AbHvADVwHSnxrHNERPdAFu5B8p' : 'So11111111111111111111111111111111111111112'))
        
        // Debug: Log all key parameters
        console.log('Stake Parameters:')
        console.log('- Challenger:', account.publicKey.toString())
        console.log('- Challenge PDA:', challengePublicKey.toString())
        console.log('- Stake Mint:', stakeMintPublicKey.toString())
        
        // Check if challenge account exists
        const challengeAccount = await connection.getAccountInfo(challengePublicKey)
        if (!challengeAccount) {
          throw new Error('Challenge account does not exist on-chain')
        }
        console.log('✓ Challenge account exists, owner:', challengeAccount.owner.toString())
        
        // Check user's token balance
        const { getAssociatedTokenAddress } = await import('@solana/spl-token')
        const challengerAta = await getAssociatedTokenAddress(
          stakeMintPublicKey,
          account.publicKey
        )
        
        try {
          const ataInfo = await connection.getAccountInfo(challengerAta)
          if (!ataInfo) {
            throw new Error('User does not have a token account for the stake mint. Please create an associated token account first.')
          }
          console.log('✓ User token account exists:', challengerAta.toString())
          
          // Parse token account data to check balance
          const tokenAccountData = Buffer.from(ataInfo.data)
          const amount = tokenAccountData.readBigUInt64LE(64) // Amount is at offset 64
          console.log('User token balance:', amount.toString())
          console.log('Required stake amount:', challenge.stakeAmount)
          
          if (amount < BigInt(challenge.stakeAmount)) {
            throw new Error(`Insufficient token balance. Required: ${challenge.stakeAmount}, Available: ${amount.toString()}`)
          }
        } catch (error: any) {
          console.error('Token balance check failed:', error)
          throw new Error(`Token balance check failed: ${error.message}`)
        }
        
        // Build stake instruction using Gill
        const stakeIx = await buildStakeInstruction({
          challenger: account.publicKey,
          challenge: challengePublicKey,
          stakeMint: stakeMintPublicKey,
        })
        
        console.log('Stake instruction accounts:')
        stakeIx.keys.forEach((key, index) => {
          console.log(`${index}: ${key.pubkey.toString()} (signer: ${key.isSigner}, writable: ${key.isWritable})`)
        })

        // Build transaction (keep it simple like create challenge)
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey
        transaction.add(stakeIx)

        console.log('Stake transaction built with', transaction.instructions.length, 'instructions')

        // Step 2: Request wallet signature and send
        onProgressUpdate(TransactionStep.SIGNING)
        
        // Step 3: Send transaction
        onProgressUpdate(TransactionStep.SENDING)
        
        // Debug: Log transaction before sending
        console.log('Transaction details:')
        console.log('- Instructions:', transaction.instructions.length)
        console.log('- Fee payer:', transaction.feePayer?.toString())
        console.log('- Recent blockhash:', transaction.recentBlockhash)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)
        console.log('Stake transaction sent:', signature)
        
        // Immediately check if transaction exists
        try {
          const txInfo = await connection.getTransaction(signature, {
            commitment: 'processed',
            maxSupportedTransactionVersion: 0
          })
          console.log('Transaction found in mempool:', !!txInfo)
        } catch (e) {
          console.log('Transaction not yet in mempool, this is normal')
        }

        // Step 4: Wait for confirmation
        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        // Wait for confirmation with timeout handling
        const confirmationResult = await Promise.race([
          connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000)
          )
        ])
        
        const result = confirmationResult as any
        
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
        
        // Get latest blockhash - use confirmed like create challenge  
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

        // Build transaction (keep it simple like create challenge)
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
        
        // Wait for confirmation with timeout handling
        const confirmationResult = await Promise.race([
          connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000)
          )
        ])
        
        const result = confirmationResult as any
        
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