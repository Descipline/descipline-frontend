import { PublicKey } from '@solana/web3.js'

export const DESCIPLINE_CONFIG = {
  PROGRAM_ID: new PublicKey('J5qn6hBAMS1YfNpN7oARJZmdjSqnsMT5Zz33tHGmLiK'),
  HELIUS_API_KEY: process.env.EXPO_PUBLIC_HELIUS_API_KEY || '',
  
  // SAS (Solana Attestation Service) Configuration - From devnet scripts
  CREDENTIAL_PDA: new PublicKey('9XoDadoNQS14omZ8UP3xQFGXxFDoYwCdPBUDzQLRoX8f'),
  CREDENTIAL_AUTHORITY_PDA: new PublicKey('6vso4DAqcnGnoWjBWU6L4RsgMmRLndX6vjntjH4zhtUa'),
  SCHEMA_PDA: new PublicKey('J2XusujyFzjnLU5cCTJALQgzyzH4dX4en3rZPZYaTUKc'),
  CREDENTIAL_NAME: 'DESCIPLINE-OFFICIAL-ORANGE',
  PLATFORM_ATTESTER: new PublicKey('H49r52ra2zrrA27dy21JVzo8YcVSrtE1LcirPGDXU8Mq'), // deployer wallet
  
  // PDA seeds
  CREDENTIAL_AUTHORITY_SEED: 'authority',
  CHALLENGE_SEED: 'challenge',
  RECEIPT_SEED: 'receipt',
  RESOLUTION_SEED: 'resolution',
  
  // Supported tokens
  SUPPORTED_TOKENS: {
    USDC: {
      mint: new PublicKey('4NQMuSBhVrqTh8FMv5AbHvADVwHSnxrHNERPdAFu5B8p'),
      decimals: 6,
      symbol: 'USDC',
    },
    WSOL: {
      mint: new PublicKey('So11111111111111111111111111111111111111112'),
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