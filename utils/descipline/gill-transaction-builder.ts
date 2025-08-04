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

// Instruction discriminators - must match descipline-lib exactly
const INSTRUCTION_DISCRIMINATORS = {
  createChallenge: [170, 244, 47, 1, 1, 15, 173, 239],
  stake: [206, 176, 202, 18, 200, 209, 179, 108],
  claim: [62, 198, 214, 193, 213, 159, 108, 210], // Matches CLAIM_DISCRIMINATOR from descipline-lib
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
  
  // Build accounts - IMPORTANT: Order must match the contract's Stake struct
  const keys: AccountMeta[] = [
    { pubkey: params.challenger, isSigner: true, isWritable: true },          // 0: challenger
    { pubkey: challengerAta, isSigner: false, isWritable: true },            // 1: challenger_ata  
    { pubkey: receiptPda, isSigner: false, isWritable: true },               // 2: receipt (to be created)
    { pubkey: vault, isSigner: false, isWritable: true },                    // 3: vault
    { pubkey: params.challenge, isSigner: false, isWritable: false },        // 4: challenge (read-only!)
    { pubkey: params.stakeMint, isSigner: false, isWritable: false },        // 5: stake_mint
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // 6: associated_token_program
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },        // 7: token_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // 8: system_program
  ]
  
  return new TransactionInstruction({
    keys,
    programId: publicKeys.PROGRAM_ID,
    data,
  })
}

/**
 * Build claim instruction using Gill
 */
export async function buildClaimInstruction(params: {
  claimer: PublicKey
  challenge: PublicKey
  stakeMint: PublicKey
  merkleProof?: string[]
  winnerIndex?: number
}): Promise<TransactionInstruction> {
  const publicKeys = getDesciplinePublicKeys()
  
  // Derive PDAs
  const [receiptPda] = deriveReceiptPda(params.challenge, params.claimer)
  
  // Derive resolution PDA - required for claim
  const [resolutionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("resolution"), params.challenge.toBuffer()],
    publicKeys.PROGRAM_ID
  )
  
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
  
  // Build instruction data with merkle proof - following contract script format
  const discriminator = Buffer.from(INSTRUCTION_DISCRIMINATORS.claim)
  let data = discriminator
  
  if (params.merkleProof !== undefined) {
    // Convert merkle proof from hex strings to Buffer and concatenate (matching descipline-lib format)
    // Handle empty proof array for single winner case
    const proofBuffers = params.merkleProof.map(hex => Buffer.from(hex, 'hex'))
    const proofBytes = proofBuffers.length > 0 ? Buffer.concat(proofBuffers) : Buffer.alloc(0)
    
    // Winner index is required for the claim instruction
    const winnerIndex = params.winnerIndex ?? 0
    
    // Match descipline-lib encoding exactly:
    // ['proof', addEncoderSizePrefix(getBytesEncoder(), getU32Encoder())] - Vec<u8> with u32 length prefix
    // ['index', getU8Encoder()] - u8 index
    
    const proofLengthBuffer = Buffer.alloc(4)
    proofLengthBuffer.writeUInt32LE(proofBytes.length, 0)
    
    const indexBuffer = Buffer.alloc(1) 
    indexBuffer.writeUInt8(winnerIndex, 0)
    
    // Combine: discriminator + u32 length + proof bytes + u8 index (matches descipline-lib)
    // This works for both empty proof (single winner) and non-empty proof (multiple winners)
    data = Buffer.concat([discriminator, proofLengthBuffer, proofBytes, indexBuffer])
    
    console.log('🌳 Built claim instruction (descipline-lib format):', {
      discriminator: discriminator.toString('hex'),
      proofElements: params.merkleProof.length,
      proofBytesLength: proofBytes.length,
      proofHex: proofBytes.toString('hex'),
      winnerIndex: winnerIndex,
      totalDataLength: data.length,
      isSingleWinner: params.merkleProof.length === 0
    })
  } else {
    console.log('⚠️ Building claim instruction without merkle proof - this will likely fail')
  }
  
  // Build accounts - following the exact order from the IDL
  const keys: AccountMeta[] = [
    { pubkey: params.claimer, isSigner: true, isWritable: true },        // winner
    { pubkey: claimerAta, isSigner: false, isWritable: true },           // winnerAta  
    { pubkey: vault, isSigner: false, isWritable: true },                // vault
    { pubkey: params.challenge, isSigner: false, isWritable: false },    // challenge (readonly!)
    { pubkey: resolutionPda, isSigner: false, isWritable: true },        // resolution
    { pubkey: receiptPda, isSigner: false, isWritable: true },           // receipt
    { pubkey: params.stakeMint, isSigner: false, isWritable: false },    // stakeMint
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },    // tokenProgram
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associatedTokenProgram
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },     // systemProgram
  ]
  
  console.log('🔧 Built claim instruction accounts (IDL order):', {
    '0_winner': params.claimer.toString(),
    '1_winnerAta': claimerAta.toString(),
    '2_vault': vault.toString(),
    '3_challenge': params.challenge.toString(),
    '4_resolution': resolutionPda.toString(),
    '5_receipt': receiptPda.toString(),
    '6_stakeMint': params.stakeMint.toString(),
    '7_tokenProgram': TOKEN_PROGRAM_ID.toString(),
    '8_associatedTokenProgram': ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
    '9_systemProgram': SystemProgram.programId.toString(),
    accountCount: keys.length
  })
  
  return new TransactionInstruction({
    keys,
    programId: publicKeys.PROGRAM_ID,
    data,
  })
}