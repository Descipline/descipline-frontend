import { PublicKey } from '@solana/web3.js'
import { DESCIPLINE_CONFIG, getDesciplinePublicKeys } from './constants'

/**
 * Derive credential authority PDA
 */
export const deriveCredentialAuthorityPda = () => {
  const { PROGRAM_ID } = getDesciplinePublicKeys()
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DESCIPLINE_CONFIG.CREDENTIAL_AUTHORITY_SEED)],
    PROGRAM_ID
  )
}

/**
 * Derive challenge PDA
 */
export const deriveChallengePda = (initiator: PublicKey, name: string) => {
  const { PROGRAM_ID } = getDesciplinePublicKeys()
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(DESCIPLINE_CONFIG.CHALLENGE_SEED),
      initiator.toBuffer(),
      Buffer.from(name),
    ],
    PROGRAM_ID
  )
}

/**
 * Derive receipt PDA
 */
export const deriveReceiptPda = (challenge: PublicKey, challenger: PublicKey) => {
  const { PROGRAM_ID } = getDesciplinePublicKeys()
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(DESCIPLINE_CONFIG.RECEIPT_SEED),
      challenge.toBuffer(),
      challenger.toBuffer(),
    ],
    PROGRAM_ID
  )
}

/**
 * Derive resolution PDA
 */
export const deriveResolutionPda = (challenge: PublicKey) => {
  const { PROGRAM_ID } = getDesciplinePublicKeys()
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DESCIPLINE_CONFIG.RESOLUTION_SEED), challenge.toBuffer()],
    PROGRAM_ID
  )
}