import { 
  PublicKey, 
  SystemProgram, 
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { 
  NATIVE_MINT,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount
} from '@solana/spl-token'
import { Connection } from '@solana/web3.js'

/**
 * Wrap SOL to wSOL instructions
 */
export async function createWrapSolInstructions(
  connection: Connection,
  userPublicKey: PublicKey,
  amount: number // Amount in lamports
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = []
  
  // Get user's wSOL ATA
  const userWsolAta = await getAssociatedTokenAddress(
    NATIVE_MINT,
    userPublicKey
  )
  
  // Check if user's wSOL ATA exists
  let wsolAtaExists = false
  try {
    await getAccount(connection, userWsolAta)
    wsolAtaExists = true
  } catch (error) {
    // ATA doesn't exist, we'll create it
    wsolAtaExists = false
  }
  
  // Create wSOL ATA if it doesn't exist
  if (!wsolAtaExists) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey, // payer
        userWsolAta,   // ata
        userPublicKey, // owner
        NATIVE_MINT    // mint
      )
    )
  }
  
  // Transfer SOL to wSOL ATA
  instructions.push(
    SystemProgram.transfer({
      fromPubkey: userPublicKey,
      toPubkey: userWsolAta,
      lamports: amount,
    })
  )
  
  // Sync native (convert SOL to wSOL tokens)
  instructions.push(
    createSyncNativeInstruction(userWsolAta)
  )
  
  return instructions
}

/**
 * Calculate total SOL needed for wrapping including fees
 */
export function calculateWrapSolAmount(
  stakeAmountLamports: number,
  includeBuffer = true
): number {
  // Base amount to wrap
  let totalAmount = stakeAmountLamports
  
  // Add buffer for transaction fees and rent if needed
  if (includeBuffer) {
    const FEE_BUFFER = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL buffer
    totalAmount += FEE_BUFFER
  }
  
  return totalAmount
}

/**
 * Check if user has enough SOL balance for wrapping
 */
export async function checkSolBalance(
  connection: Connection,
  userPublicKey: PublicKey,
  requiredAmount: number
): Promise<{ hasEnough: boolean, balance: number, shortfall: number }> {
  const balance = await connection.getBalance(userPublicKey)
  const hasEnough = balance >= requiredAmount
  const shortfall = hasEnough ? 0 : requiredAmount - balance
  
  return {
    hasEnough,
    balance,
    shortfall
  }
}

/**
 * Format SOL amount for display
 */
export function formatSolAmount(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4)
}