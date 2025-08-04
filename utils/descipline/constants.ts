import { PublicKey } from '@solana/web3.js'

// Address constants as strings to avoid early PublicKey construction
const ADDRESSES = {
  PROGRAM_ID: 'GYvSKR5kzDnf78iARutLVewr77ra88JZrdHuGowKuQmS',
  CREDENTIAL_PDA: '9XoDadoNQS14omZ8UP3xQFGXxFDoYwCdPBUDzQLRoX8f',
  CREDENTIAL_AUTHORITY_PDA: '8jy6URmqNj7sEK669C6EMD2Ar6DASQuce7sPZ8BXKkdb',
  SCHEMA_PDA: 'J2XusujyFzjnLU5cCTJALQgzyzH4dX4en3rZPZYaTUKc',
  PLATFORM_ATTESTER: 'H49r52ra2zrrA27dy21JVzo8YcVSrtE1LcirPGDXU8Mq',
  USDC_MINT: '4NQMuSBhVrqTh8FMv5AbHvADVwHSnxrHNERPdAFu5B8p',
  WSOL_MINT: 'So11111111111111111111111111111111111111112',
} as const

// Lazy initialization function to create PublicKeys when needed
export function getDesciplinePublicKeys() {
  return {
    PROGRAM_ID: new PublicKey(ADDRESSES.PROGRAM_ID),
    CREDENTIAL_PDA: new PublicKey(ADDRESSES.CREDENTIAL_PDA),
    CREDENTIAL_AUTHORITY_PDA: new PublicKey(ADDRESSES.CREDENTIAL_AUTHORITY_PDA),
    SCHEMA_PDA: new PublicKey(ADDRESSES.SCHEMA_PDA),
    PLATFORM_ATTESTER: new PublicKey(ADDRESSES.PLATFORM_ATTESTER),
    USDC_MINT: new PublicKey(ADDRESSES.USDC_MINT),
    WSOL_MINT: new PublicKey(ADDRESSES.WSOL_MINT),
  }
}

export const DESCIPLINE_CONFIG = {
  // Use lazy initialization to avoid React Native PublicKey issues
  get PROGRAM_ID() { return new PublicKey(ADDRESSES.PROGRAM_ID) },
  get CREDENTIAL_PDA() { return new PublicKey(ADDRESSES.CREDENTIAL_PDA) },
  get SCHEMA_PDA() { return new PublicKey(ADDRESSES.SCHEMA_PDA) },
  
  // Use address strings instead of PublicKey objects
  PROGRAM_ID_STRING: ADDRESSES.PROGRAM_ID,
  HELIUS_API_KEY: process.env.EXPO_PUBLIC_HELIUS_API_KEY || '',
  
  // SAS (Solana Attestation Service) Configuration - From devnet scripts
  CREDENTIAL_PDA_STRING: ADDRESSES.CREDENTIAL_PDA,
  CREDENTIAL_AUTHORITY_PDA_STRING: ADDRESSES.CREDENTIAL_AUTHORITY_PDA,
  SCHEMA_PDA_STRING: ADDRESSES.SCHEMA_PDA,
  CREDENTIAL_NAME: 'DESCIPLINE-OFFICIAL-ORANGE',
  PLATFORM_ATTESTER_STRING: ADDRESSES.PLATFORM_ATTESTER,
  
  // PDA seeds
  CREDENTIAL_AUTHORITY_SEED: 'authority',
  CHALLENGE_SEED: 'challenge',
  RECEIPT_SEED: 'receipt',
  RESOLUTION_SEED: 'resolution',
  
  // Supported tokens - using strings instead of PublicKey objects
  SUPPORTED_TOKENS: {
    USDC: {
      mint: ADDRESSES.USDC_MINT,
      decimals: 6,
      symbol: 'USDC',
    },
    WSOL: {
      mint: ADDRESSES.WSOL_MINT,
      decimals: 9,
      symbol: 'wSOL',
    },
  },
  
  // Fee configuration
  MIN_FEE: 0,
  MAX_FEE: 10000, // 100%
  
  // UI Configuration
  DEFAULT_COMMITMENT: 'confirmed' as const,
}

// Query keys for React Query
export const desciplineKeys = {
  all: ['descipline'] as const,
  challenges: () => [...desciplineKeys.all, 'challenges'] as const,
  challenge: (id: string) => [...desciplineKeys.challenges(), id] as const,
  receipts: (challengeId: string) => [...desciplineKeys.all, 'receipts', challengeId] as const,
  resolution: (challengeId: string) => [...desciplineKeys.all, 'resolution', challengeId] as const,
  attestation: (userId: string) => [...desciplineKeys.all, 'attestation', userId] as const,
  // User-specific queries
  userCreatedChallenges: (userId: string) => [...desciplineKeys.all, 'userCreated', userId] as const,
  userParticipatedChallenges: (userId: string) => [...desciplineKeys.all, 'userParticipated', userId] as const,
  userRewardHistory: (userId: string) => [...desciplineKeys.all, 'userRewards', userId] as const,
  userStats: (userId: string) => [...desciplineKeys.all, 'userStats', userId] as const,
}