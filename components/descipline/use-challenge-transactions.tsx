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

interface ClaimRewardParams {
  challenge: Challenge
  merkleProof?: string[]
  winnerIndex?: number
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
        
        // Check if it's WSOL (native SOL) or USDC
        const isWSol = stakeMintPublicKey.equals(new PublicKey('So11111111111111111111111111111111111111112'))
        
        try {
          const ataInfo = await connection.getAccountInfo(challengerAta)
          
          if (!ataInfo && isWSol) {
            // For WSOL, we need to create ATA and wrap SOL
            console.log('⚠️  WSOL ATA does not exist, need to create and wrap SOL')
            
            // Check native SOL balance
            const solBalance = await connection.getBalance(account.publicKey)
            const requiredAmount = BigInt(challenge.stakeAmount)
            const rentExemption = BigInt(2039280) // Rent exemption for token account
            
            console.log('Native SOL balance:', solBalance.toString())
            console.log('Required WSOL amount:', requiredAmount.toString())
            console.log('Rent exemption needed:', rentExemption.toString())
            
            if (BigInt(solBalance) < requiredAmount + rentExemption + BigInt(5000)) { // 5000 lamports for transaction fees
              throw new Error(`Insufficient SOL balance. Required: ${(requiredAmount + rentExemption + BigInt(5000)).toString()} lamports, Available: ${solBalance.toString()} lamports`)
            }
            
            console.log('✓ Sufficient SOL balance for wrapping')
          } else if (!ataInfo) {
            // For USDC or other tokens, user must have ATA
            throw new Error('User does not have a token account for the stake mint. Please create an associated token account first.')
          } else {
            console.log('✓ User token account exists:', challengerAta.toString())
            
            // Parse token account data to check balance
            const tokenAccountData = Buffer.from(ataInfo.data)
            const amount = tokenAccountData.readBigUInt64LE(64) // Amount is at offset 64
            console.log('User token balance:', amount.toString())
            console.log('Required stake amount:', challenge.stakeAmount)
            
            if (amount < BigInt(challenge.stakeAmount)) {
              const decimals = isWSol ? 9 : 6 // WSOL has 9 decimals, USDC has 6
              const availableFormatted = (Number(amount) / Math.pow(10, decimals)).toFixed(decimals)
              const requiredFormatted = (Number(challenge.stakeAmount) / Math.pow(10, decimals)).toFixed(decimals)
              throw new Error(`Insufficient token balance. Required: ${requiredFormatted} ${challenge.tokenAllowed}, Available: ${availableFormatted} ${challenge.tokenAllowed}`)
            }
          }
        } catch (error: any) {
          console.error('Token balance check failed:', error)
          throw error
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

        // Build transaction
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey
        
        // For WSOL, add ATA creation and SOL wrapping instructions if needed
        if (isWSol) {
          const ataInfo = await connection.getAccountInfo(challengerAta)
          if (!ataInfo) {
            console.log('Adding WSOL ATA creation and wrapping instructions...')
            
            const { 
              createAssociatedTokenAccountInstruction,
              createSyncNativeInstruction,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            } = await import('@solana/spl-token')
            const { SystemProgram } = await import('@solana/web3.js')
            
            // 1. Create Associated Token Account for WSOL
            const createAtaIx = createAssociatedTokenAccountInstruction(
              account.publicKey, // payer
              challengerAta,     // ata
              account.publicKey, // owner
              stakeMintPublicKey, // mint (WSOL)
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
            
            // 2. Transfer SOL to the ATA (this wraps SOL to WSOL)
            const wrapSolIx = SystemProgram.transfer({
              fromPubkey: account.publicKey,
              toPubkey: challengerAta,
              lamports: BigInt(challenge.stakeAmount)
            })
            
            // 3. Sync native (mark the account as a native token account)
            const syncNativeIx = createSyncNativeInstruction(challengerAta, TOKEN_PROGRAM_ID)
            
            // Add all instructions in order
            transaction.add(createAtaIx)
            transaction.add(wrapSolIx)
            transaction.add(syncNativeIx)
            
            console.log('Added 3 WSOL setup instructions: createATA, wrapSOL, syncNative')
          }
        }
        
        // Add the stake instruction
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
    mutationFn: async ({ challenge, merkleProof, winnerIndex, onProgressUpdate, resolutionData }: ClaimRewardParams & { resolutionData?: any }) => {
      try {
        if (!account) {
          throw new Error('Wallet not connected')
        }

        console.log('🎭 MOCK: Claiming reward for challenge:', challenge.publicKey, 'with user:', account.publicKey.toString())

        onProgressUpdate(TransactionStep.PREPARING)
        
        // MOCK: Calculate reward amount based on resolution data
        let rewardAmount = challenge.stakeAmount // Default fallback
        
        if (resolutionData) {
          // Correct calculation: total pool = stakeAmount × totalParticipants, divided by winnerCount
          const totalPool = challenge.stakeAmount * resolutionData.totalParticipants
          rewardAmount = totalPool / resolutionData.winnerCount
          
          console.log('💰 MOCK: Reward calculation based on resolution data:', {
            stakeAmount: challenge.stakeAmount / 1e6,
            totalParticipants: resolutionData.totalParticipants,
            winnerCount: resolutionData.winnerCount,
            totalPool: totalPool / 1e6,
            rewardPerWinner: rewardAmount / 1e6
          })
        } else {
          console.log('⚠️ MOCK: Resolution data not provided, using fallback calculation')
        }
        
        console.log('💰 MOCK: Calculated reward amount:', rewardAmount / 1e6, 'USDC (simulated)')
        
        // Get latest blockhash for self-transfer transaction  
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
        
        console.log('🎁 MOCK: Preparing self-transfer to simulate claim:', {
          claimer: account.publicKey.toString(),
          challenge: challenge.publicKey,
          mockRewardAmount: rewardAmount / 1e6,
          merkleProofLength: merkleProof?.length || 0,
          winnerIndex: winnerIndex ?? 0,
          proof: merkleProof
        })

        // MOCK: Create a simple self-transfer transaction to simulate claim
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey
        
        // Add a minimal SOL self-transfer (0.001 SOL) to simulate the claim
        const { SystemProgram } = await import('@solana/web3.js')
        const mockTransferIx = SystemProgram.transfer({
          fromPubkey: account.publicKey,
          toPubkey: account.publicKey, // Self-transfer
          lamports: 1000000, // 0.001 SOL
        })
        
        transaction.add(mockTransferIx)

        console.log('🎭 MOCK: Claim transaction built with self-transfer simulation')

        onProgressUpdate(TransactionStep.SIGNING)
        onProgressUpdate(TransactionStep.SENDING)
        
        const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)
        console.log('🎭 MOCK: Self-transfer sent to simulate claim:', signature)

        onProgressUpdate(TransactionStep.CONFIRMING, { signature })
        
        // Standard confirmation timeout like other transactions
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
        
        console.log('🎭 MOCK: Claim transaction confirmation result:', result)

        if (result.value.err) {
          throw new Error(`MOCK Claim failed: ${JSON.stringify(result.value.err)}`)
        }

        console.log('🎉 MOCK: Claim reward simulation completed successfully!')
        console.log(`💰 MOCK: Simulated reward of ${rewardAmount / 1e6} USDC claimed`)
        console.log('ℹ️  MOCK: This is a self-transfer simulation for testing purposes')
        
        onProgressUpdate(TransactionStep.SUCCESS, { signature })
        
        return { signature, success: true, mockReward: rewardAmount }
      } catch (error: any) {
        console.error('Claim transaction failed:', error)
        onProgressUpdate(TransactionStep.ERROR, { error: error.message })
        throw error
      }
    }
  })
}