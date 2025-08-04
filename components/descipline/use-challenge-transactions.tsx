import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { Challenge } from '@/utils/descipline/types'
import { TransactionStep } from './ui/transaction-progress-modal'
import { useDescipline } from '@/components/descipline/descipline-provider'
import { deriveReceiptPda } from '@/utils/descipline/pda'
import { getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'

interface StakeChallengeParams {
  challenge: Challenge
  onProgressUpdate: (step: TransactionStep, data?: any) => void
}

export function useStakeChallenge() {
  const connection = useConnection()
  const { account } = useAuth()
  const { signAndSendTransaction } = useMobileWallet()
  const { program } = useDescipline()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!account) {
          throw new Error('Wallet not connected')
        }

        if (!program) {
          throw new Error('Descipline program not initialized')
        }

        console.log('Staking challenge:', challenge.publicKey, 'with user:', account.publicKey.toString())

        // Step 1: Preparing transaction
        onProgressUpdate(TransactionStep.PREPARING)
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Parse challenge data
        const challengePublicKey = new PublicKey(challenge.publicKey)
        const stakeMintPublicKey = new PublicKey(challenge.stakeMint || challenge.tokenAllowed === 'USDC' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : 'So11111111111111111111111111111111111111112')
        
        // Derive receipt PDA
        const [receiptPda] = deriveReceiptPda(challengePublicKey, account.publicKey)
        console.log('Receipt PDA:', receiptPda.toString())
        
        // Get challenger's ATA (user's token account)
        const challengerAta = await getAssociatedTokenAddress(
          stakeMintPublicKey,
          account.publicKey
        )
        
        // Get vault ATA (challenge's token account) 
        const vault = await getAssociatedTokenAddress(
          stakeMintPublicKey,
          challengePublicKey,
          true // allowOffCurve = true for PDA
        )
        
        console.log('Challenger ATA:', challengerAta.toString())
        console.log('Vault ATA:', vault.toString())
        console.log('Stake Mint:', stakeMintPublicKey.toString())

        // Build stake instruction
        const stakeIx = await program.methods
          .stake()
          .accounts({
            challenger: account.publicKey,
            challengerAta,
            receipt: receiptPda,
            vault,
            challenge: challengePublicKey,
            stakeMint: stakeMintPublicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()

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

        if (result.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`)
        }

        // Step 5: Success
        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, receiptPda: receiptPda.toString(), success: true }
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
  const { program } = useDescipline()

  return useMutation({
    mutationFn: async ({ challenge, onProgressUpdate }: StakeChallengeParams) => {
      try {
        if (!account) {
          throw new Error('Wallet not connected')
        }

        if (!program) {
          throw new Error('Descipline program not initialized')
        }

        console.log('Claiming reward for challenge:', challenge.publicKey, 'with user:', account.publicKey.toString())

        onProgressUpdate(TransactionStep.PREPARING)
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Parse challenge data
        const challengePublicKey = new PublicKey(challenge.publicKey)
        const stakeMintPublicKey = new PublicKey(challenge.stakeMint || challenge.tokenAllowed === 'USDC' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : 'So11111111111111111111111111111111111111112')
        
        // Derive receipt PDA
        const [receiptPda] = deriveReceiptPda(challengePublicKey, account.publicKey)
        console.log('Receipt PDA:', receiptPda.toString())
        
        // Get claimer's ATA (user's token account)
        const claimerAta = await getAssociatedTokenAddress(
          stakeMintPublicKey,
          account.publicKey
        )
        
        // Get vault ATA (challenge's token account)
        const vault = await getAssociatedTokenAddress(
          stakeMintPublicKey,
          challengePublicKey,
          true // allowOffCurve = true for PDA
        )
        
        console.log('Claimer ATA:', claimerAta.toString())
        console.log('Vault ATA:', vault.toString())
        console.log('Stake Mint:', stakeMintPublicKey.toString())

        // Note: Real claim instruction would need merkle proof for winners
        // This is a simplified version - full implementation needs:
        // 1. Merkle proof verification
        // 2. Resolution PDA
        // 3. Winner validation
        
        // For now, this is a placeholder that attempts to call claim
        // The smart contract will handle the validation
        const claimIx = await program.methods
          .claim(
            // TODO: Add merkle proof parameters when implemented
            // merkleProof: number[],
            // winnerIndex: number,
            // amount: BN
          )
          .accounts({
            claimer: account.publicKey,
            claimerAta,
            receipt: receiptPda,
            vault,
            challenge: challengePublicKey,
            // resolution: resolutionPda, // TODO: Add resolution PDA
            stakeMint: stakeMintPublicKey,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()

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