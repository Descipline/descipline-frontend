import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

// Token types - 枚举用于表单
export enum TokenAllowed {
  USDC = 'usdc',
  WSOL = 'wsol',
}

// 链上数据的代币类型格式
export type OnChainTokenAllowed = 
  | { usdc: {} }
  | { wsol: {} }

// Challenge state - 链上数据格式
export interface Challenge {
  name: string
  initiator: PublicKey
  tokenAllowed: OnChainTokenAllowed
  stakeAmount: BN
  fee: number
  stakeEndAt: BN
  claimStartFrom: BN
  schema: PublicKey
  attestor: PublicKey
  bump: number
}

// Receipt state
export interface Receipt {
  bump: number
}

// Resolution state
export interface Resolution {
  rootHash: number[]
  winnerCount: number
  winnerNotclaimCount: number
  winnerListUri: number[]
  bump: number
}

// UI-specific types
export interface ChallengeWithDetails extends Challenge {
  publicKey: PublicKey
  participantCount: number
  isResolved: boolean
  resolution?: Resolution
  totalStaked: BN
  participants?: Array<{
    address: string
    stakeAmount: number
    participationTime: Date
    isWinner: boolean
    hasClaimed: boolean
    receiptPda: any
    isCurrentUser?: boolean
    signature?: string
  }>
}

// Form types
export interface CreateChallengeFormData {
  name: string
  tokenType: TokenAllowed
  stakeAmount: string
  fee: number
  stakeEndAt: Date
  claimStartFrom: Date
}

// Transaction result
export interface TransactionResult {
  signature: string
  error?: Error
}

// 辅助函数：检查链上代币类型
export function isUSDCToken(tokenAllowed: OnChainTokenAllowed): boolean {
  return 'usdc' in tokenAllowed
}

export function isSOLToken(tokenAllowed: OnChainTokenAllowed): boolean {
  return 'wsol' in tokenAllowed
}

export function getTokenSymbol(tokenAllowed: OnChainTokenAllowed): string {
  return isUSDCToken(tokenAllowed) ? 'USDC' : 'SOL'
}

export function getTokenDecimals(tokenAllowed: OnChainTokenAllowed): number {
  return isUSDCToken(tokenAllowed) ? 6 : 9
}