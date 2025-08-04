import { useMutation } from '@tanstack/react-query'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { CreateChallengeFormData, TokenAllowed } from '@/utils/descipline/types'
import { TransactionStep } from '../ui/transaction-progress-modal'
import { deriveChallengePda, deriveCredentialAuthorityPda } from '@/utils/descipline/pda'
import { useDescipline } from '@/components/descipline/descipline-provider'
import { getDesciplinePublicKeys } from '@/utils/descipline/constants'
import { getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import { createWrapSolInstructions, calculateWrapSolAmount, checkSolBalance } from '@/utils/descipline/wrap-sol'

interface CreateChallengeParams extends CreateChallengeFormData {
  onProgress?: (step: TransactionStep, data?: any) => void
}

export function useCreateChallenge() {
  const connection = useConnection()
  const { account } = useAuth()
  const { signAndSendTransaction } = useMobileWallet()
  const { program } = useDescipline()

  return useMutation({
    mutationFn: async (params: CreateChallengeParams) => {
      try {
        console.log('Creating challenge with params:', params)
        
        if (!account) {
          throw new Error('Wallet not connected')
        }

        if (!program) {
          throw new Error('Descipline program not initialized')
        }

        const { onProgress, ...formData } = params

        // Step 1: Preparing transaction
        onProgress?.(TransactionStep.PREPARING)
        
        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        
        // Parse form data
        const isUsingSOL = formData.tokenType === TokenAllowed.WSOL
        const stakeAmountRaw = parseInt(formData.stakeAmount) * (isUsingSOL ? 1e9 : 1e6) // Convert to base units
        
        // Derive PDAs
        const [challengePda] = deriveChallengePda(account.publicKey, formData.name)
        const [credentialAuthorityPda] = deriveCredentialAuthorityPda()
        
        console.log('Challenge PDA:', challengePda.toString())
        console.log('Credential Authority PDA:', credentialAuthorityPda.toString())
        
        // Get public keys
        const publicKeys = getDesciplinePublicKeys()
        
        // Get token mint
        const stakeMint = isUsingSOL ? NATIVE_MINT : publicKeys.USDC_MINT
        
        // Get vault ATA (challenge's token account)
        const vault = await getAssociatedTokenAddress(
          stakeMint,
          challengePda,
          true // allowOffCurve = true for PDA
        )
        
        console.log('Vault ATA:', vault.toString())
        console.log('Stake Mint:', stakeMint.toString())
        
        // Convert dates to Unix timestamps
        const stakeEndAtUnix = Math.floor(formData.stakeEndAt.getTime() / 1000)
        const claimStartFromUnix = Math.floor(formData.claimStartFrom.getTime() / 1000)
        
        // Build create challenge instruction
        const createChallengeIx = await program.methods
          .createChallenge(
            formData.name,
            isUsingSOL ? { wsol: {} } : { usdc: {} },
            new BN(stakeAmountRaw),
            formData.fee,
            new BN(stakeEndAtUnix),
            new BN(claimStartFromUnix)
          )
          .accounts({
            initiator: account.publicKey,
            vault,
            challenge: challengePda,
            schema: publicKeys.SCHEMA_PDA,
            credential: publicKeys.CREDENTIAL_PDA,
            credentialAuthority: credentialAuthorityPda,
            stakeMint,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()

        // Build transaction
        const transaction = new Transaction()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = account.publicKey

        // Add SOL wrapping instructions if needed
        if (isUsingSOL) {
          console.log('Adding SOL wrapping instructions for', stakeAmountRaw, 'lamports')
          
          // Check SOL balance first
          const requiredSol = calculateWrapSolAmount(stakeAmountRaw, true)
          const balanceCheck = await checkSolBalance(connection, account.publicKey, requiredSol)
          
          if (!balanceCheck.hasEnough) {
            throw new Error(`Insufficient SOL balance. Need ${requiredSol / 1e9} SOL, have ${balanceCheck.balance / 1e9} SOL`)
          }
          
          const wrapInstructions = await createWrapSolInstructions(
            connection,
            account.publicKey,
            stakeAmountRaw
          )
          
          wrapInstructions.forEach(ix => transaction.add(ix))
        }

        // Add create challenge instruction
        transaction.add(createChallengeIx)

        console.log('Transaction built with', transaction.instructions.length, 'instructions')

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
          throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`)
        }

        // Step 4: Success
        onProgress?.(TransactionStep.SUCCESS, { signature })
        
        return {
          signature,
          challengeId: challengePda.toString(),
          challengePda: challengePda.toString(),
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