import { PublicKey } from '@solana/web3.js'
import { DESCIPLINE_CONFIG } from './constants'

/**
 * Derive credential authority PDA
 */
export const deriveCredentialAuthorityPda = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DESCIPLINE_CONFIG.CREDENTIAL_AUTHORITY_SEED)],
    DESCIPLINE_CONFIG.PROGRAM_ID
  )
}

/**
 * Derive challenge PDA
 */
export const deriveChallengePda = (initiator: PublicKey, name: string) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(DESCIPLINE_CONFIG.CHALLENGE_SEED),
      initiator.toBuffer(),
      Buffer.from(name),
    ],
    DESCIPLINE_CONFIG.PROGRAM_ID
  )
}

/**
 * Derive receipt PDA
 */
export const deriveReceiptPda = (challenge: PublicKey, challenger: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(DESCIPLINE_CONFIG.RECEIPT_SEED),
      challenge.toBuffer(),
      challenger.toBuffer(),
    ],
    DESCIPLINE_CONFIG.PROGRAM_ID
  )
}

/**
 * Derive resolution PDA
 */
export const deriveResolutionPda = (challenge: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DESCIPLINE_CONFIG.RESOLUTION_SEED), challenge.toBuffer()],
    DESCIPLINE_CONFIG.PROGRAM_ID
  )
}