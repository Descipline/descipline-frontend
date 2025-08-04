import { 
  Transaction, 
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  AccountMeta
} from '@solana/web3.js'
import { 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token'
import { getDesciplinePublicKeys } from './constants'
import { deriveChallengePda, deriveCredentialAuthorityPda, deriveReceiptPda } from './pda'
import { TokenAllowed } from './types'

// Instruction discriminators from IDL
const INSTRUCTION_DISCRIMINATORS = {
  createChallenge: [170, 244, 47, 1, 1, 15, 173, 239],
  stake: [206, 176, 202, 18, 200, 209, 179, 108],
  claim: [62, 198, 214, 193, 213, 159, 108, 210],
} as const

/**
 * Build create challenge instruction using Gill (no Anchor)
 */
export async function buildCreateChallengeInstruction(params: {
  initiator: PublicKey
  name: string
  tokenAllowed: TokenAllowed
  stakeAmount: bigint
  fee: number
  stakeEndAt: number
  claimStartFrom: number
}): Promise<TransactionInstruction> {
  const publicKeys = getDesciplinePublicKeys()
  
  // Derive PDAs
  const [challengePda] = deriveChallengePda(params.initiator, params.name)
  const [credentialAuthorityPda] = deriveCredentialAuthorityPda()
  
  // Get token mint
  const stakeMint = params.tokenAllowed === TokenAllowed.WSOL 
    ? publicKeys.WSOL_MINT 
    : publicKeys.USDC_MINT
  
  // Get vault ATA
  const vault = await getAssociatedTokenAddress(
    stakeMint,
    challengePda,
    true // allowOffCurve for PDA
  )
  
  // Build instruction data
  const data = Buffer.concat([
    // Discriminator
    Buffer.from(INSTRUCTION_DISCRIMINATORS.createChallenge),
    // Name (string: length + data)
    Buffer.from(new Uint32Array([params.name.length]).buffer),
    Buffer.from(params.name, 'utf-8'),
    // TokenAllowed (enum: 0 for WSOL, 1 for USDC)
    Buffer.from([params.tokenAllowed === TokenAllowed.WSOL ? 0 : 1]),
    // Stake amount (u64)
    Buffer.from(new BigUint64Array([params.stakeAmount]).buffer),
    // Fee (u16)
    Buffer.from(new Uint16Array([params.fee]).buffer),
    // Stake end at (i64)
    Buffer.from(new BigInt64Array([BigInt(params.stakeEndAt)]).buffer),
    // Claim start from (i64)
    Buffer.from(new BigInt64Array([BigInt(params.claimStartFrom)]).buffer),
  ])
  
  // Build accounts
  const keys: AccountMeta[] = [
    { pubkey: params.initiator, isSigner: true, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: challengePda, isSigner: false, isWritable: true },
    { pubkey: publicKeys.SCHEMA_PDA, isSigner: false, isWritable: false },
    { pubkey: publicKeys.CREDENTIAL_PDA, isSigner: false, isWritable: false },
    { pubkey: credentialAuthorityPda, isSigner: false, isWritable: false },
    { pubkey: stakeMint, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ]
  
  return new TransactionInstruction({
    keys,
    programId: publicKeys.PROGRAM_ID,
    data,
  })
}

/**
 * Build stake instruction using Gill
 */
export async function buildStakeInstruction(params: {
  challenger: PublicKey
  challenge: PublicKey
  stakeMint: PublicKey
}): Promise<TransactionInstruction> {
  const publicKeys = getDesciplinePublicKeys()
  
  // Derive PDAs
  const [receiptPda] = deriveReceiptPda(params.challenge, params.challenger)
  
  // Get ATAs
  const challengerAta = await getAssociatedTokenAddress(
    params.stakeMint,
    params.challenger
  )
  
  const vault = await getAssociatedTokenAddress(
    params.stakeMint,
    params.challenge,
    true // allowOffCurve for PDA
  )
  
  // Build instruction data (just discriminator for stake)
  const data = Buffer.from(INSTRUCTION_DISCRIMINATORS.stake)
  
  // Build accounts
  const keys: AccountMeta[] = [
    { pubkey: params.challenger, isSigner: true, isWritable: true },
    { pubkey: challengerAta, isSigner: false, isWritable: true },
    { pubkey: receiptPda, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: params.challenge, isSigner: false, isWritable: true },
    { pubkey: params.stakeMint, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ]
  
  return new TransactionInstruction({
    keys,
    programId: publicKeys.PROGRAM_ID,
    data,
  })
}

/**
 * Build claim instruction using Gill
 * Note: This is simplified - real claim needs merkle proof
 */
export async function buildClaimInstruction(params: {
  claimer: PublicKey
  challenge: PublicKey
  stakeMint: PublicKey
  // TODO: Add merkle proof params when implemented
}): Promise<TransactionInstruction> {
  const publicKeys = getDesciplinePublicKeys()
  
  // Derive PDAs
  const [receiptPda] = deriveReceiptPda(params.challenge, params.claimer)
  
  // Get ATAs
  const claimerAta = await getAssociatedTokenAddress(
    params.stakeMint,
    params.claimer
  )
  
  const vault = await getAssociatedTokenAddress(
    params.stakeMint,
    params.challenge,
    true // allowOffCurve for PDA
  )
  
  // Build instruction data
  // TODO: Add merkle proof data when implemented
  const data = Buffer.from(INSTRUCTION_DISCRIMINATORS.claim)
  
  // Build accounts
  const keys: AccountMeta[] = [
    { pubkey: params.claimer, isSigner: true, isWritable: true },
    { pubkey: claimerAta, isSigner: false, isWritable: true },
    { pubkey: receiptPda, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: params.challenge, isSigner: false, isWritable: true },
    // TODO: Add resolution PDA when implemented
    { pubkey: params.stakeMint, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ]
  
  return new TransactionInstruction({
    keys,
    programId: publicKeys.PROGRAM_ID,
    data,
  })
}