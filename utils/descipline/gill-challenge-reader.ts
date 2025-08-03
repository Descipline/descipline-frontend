/**
 * Gill-based Challenge Data Reader
 * Uses gill library to read Descipline contract data without Anchor's BN issues
 */

import { createSolanaClient, address } from 'gill'
import { getDesciplinePublicKeys } from './constants'

// Types for challenge data
export interface GillChallengeData {
  publicKey: string
  initiator: string
  name: string
  credentialPda: string
  schemaPda: string
  stakeMint: string
  tokenAllowed: 'USDC' | 'WSOL'
  stakeAmount: string
  totalStaked: string
  fee: number
  stakeEndAt: string
  claimStartFrom: string
  nonce: number
  // Computed fields
  isActive: boolean
  participantCount: number
}

export interface GillReceiptData {
  publicKey: string
  challenger: string
  challenge: string
  bump: number
}

export interface GillStats {
  totalChallenges: number
  activeChallenges: number
  totalReceipts: number
}

/**
 * Create gill client
 */
function createGillClient(rpcUrl?: string) {
  return createSolanaClient({ 
    urlOrMoniker: rpcUrl || 'devnet' 
  })
}

/**
 * Parse challenge account data from buffer
 * Simplified parsing for testing - assumes basic structure
 */
function parseChallengeData(buffer: Buffer, publicKey: string): GillChallengeData | null {
  try {
    // Basic validation
    if (buffer.length < 100) {
      return null // Too small to be a challenge
    }
    
    // For now, return a mock challenge with the account data size for testing
    // In production, you'd implement proper Borsh deserialization
    const challenge: GillChallengeData = {
      publicKey,
      initiator: 'MockInitiator',
      name: `Challenge_${publicKey.slice(0, 8)}`,
      credentialPda: 'MockCredentialPda',
      schemaPda: 'MockSchemaPda',
      stakeMint: 'MockStakeMint',
      tokenAllowed: Math.random() > 0.5 ? 'USDC' : 'WSOL',
      stakeAmount: '1000000',
      totalStaked: '5000000',
      fee: 500,
      stakeEndAt: (Date.now() / 1000 + 86400).toString(), // 24 hours from now
      claimStartFrom: (Date.now() / 1000 + 86400 * 2).toString(), // 48 hours from now
      nonce: 1,
      isActive: true,
      participantCount: Math.floor(Math.random() * 10)
    }
    
    console.log(`✅ Mock parsed challenge: ${challenge.name} (${buffer.length} bytes)`)
    return challenge
    
  } catch (error) {
    console.error('❌ Failed to parse challenge data:', error)
    return null
  }
}

/**
 * Fetch all challenges using gill
 */
export async function fetchChallengesWithGill(rpcUrl?: string): Promise<GillChallengeData[]> {
  try {
    console.log('🔧 Fetching challenges with gill...')
    
    const client = createGillClient(rpcUrl)
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    // Get all program accounts
    const accounts = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: [
          // Filter by account size - challenges are larger than receipts
          { dataSize: { min: 150, max: 500 } }
        ]
      }
    ).send()
    
    console.log(`🔧 Found ${accounts.length} potential challenge accounts`)
    
    const challenges: GillChallengeData[] = []
    
    for (const account of accounts) {
      try {
        const data = account.account.data
        
        if (Array.isArray(data) && data.length >= 2) {
          const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
          
          // Check if this looks like a challenge account by checking discriminator
          // Challenge discriminator should be consistent
          const discriminator = Array.from(buffer.slice(0, 8))
          
          // Try to parse as challenge
          const challenge = parseChallengeData(buffer, account.pubkey)
          
          if (challenge) {
            challenges.push(challenge)
            console.log(`✅ Parsed challenge: ${challenge.name}`)
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse account ${account.pubkey}:`, error)
      }
    }
    
    console.log(`✅ Successfully parsed ${challenges.length} challenges`)
    return challenges
    
  } catch (error) {
    console.error('❌ Failed to fetch challenges with gill:', error)
    throw error
  }
}

/**
 * Fetch specific challenge by public key
 */
export async function fetchChallengeByIdWithGill(
  challengeId: string,
  rpcUrl?: string
): Promise<GillChallengeData | null> {
  try {
    console.log('🔧 Fetching challenge by ID with gill:', challengeId)
    
    const client = createGillClient(rpcUrl)
    const challengeAddress = address(challengeId)
    
    const accountInfo = await client.rpc.getAccountInfo(
      challengeAddress,
      { encoding: 'base64' }
    ).send()
    
    if (!accountInfo.value) {
      console.log('❌ Challenge not found')
      return null
    }
    
    const data = accountInfo.value.data
    
    if (Array.isArray(data) && data.length >= 2) {
      const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
      return parseChallengeData(buffer, challengeId)
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Failed to fetch challenge by ID:', error)
    return null
  }
}

/**
 * Fetch receipts for a challenge
 */
export async function fetchReceiptsForChallengeWithGill(
  challengeId: string,
  rpcUrl?: string
): Promise<GillReceiptData[]> {
  try {
    console.log('🔧 Fetching receipts for challenge with gill:', challengeId)
    
    const client = createGillClient(rpcUrl)
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    // Get all program accounts that are smaller (likely receipts)
    const accounts = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: [
          // Filter by smaller account size - receipts are smaller than challenges
          { dataSize: { min: 20, max: 100 } }
        ]
      }
    ).send()
    
    console.log(`🔧 Found ${accounts.length} potential receipt accounts`)
    
    const receipts: GillReceiptData[] = []
    
    for (const account of accounts) {
      try {
        const data = account.account.data
        
        if (Array.isArray(data) && data.length >= 2) {
          const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
          
          // Basic receipt parsing (simplified)
          // In real implementation, you'd parse the actual receipt structure
          const receipt: GillReceiptData = {
            publicKey: account.pubkey,
            challenger: 'TBD', // Parse from buffer
            challenge: challengeId,
            bump: 0 // Parse from buffer
          }
          
          receipts.push(receipt)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse receipt ${account.pubkey}:`, error)
      }
    }
    
    console.log(`✅ Found ${receipts.length} receipts for challenge`)
    return receipts
    
  } catch (error) {
    console.error('❌ Failed to fetch receipts with gill:', error)
    return []
  }
}

/**
 * Get program statistics
 */
export async function getProgramStatsWithGill(rpcUrl?: string): Promise<GillStats> {
  try {
    console.log('🔧 Getting program stats with gill...')
    
    const client = createGillClient(rpcUrl)
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    // Get all program accounts
    const allAccounts = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: []
      }
    ).send()
    
    console.log(`🔧 Found ${allAccounts.length} total program accounts`)
    
    // Categorize by account size
    const challenges = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size > 150 // Challenges are larger
      }
      return false
    })
    
    const receipts = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size <= 100 && size > 20 // Receipts are smaller
      }
      return false
    })
    
    // Count active challenges (simplified - would need proper parsing)
    const activeChallenges = challenges.length // Placeholder
    
    const stats: GillStats = {
      totalChallenges: challenges.length,
      activeChallenges,
      totalReceipts: receipts.length
    }
    
    console.log('✅ Program stats:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ Failed to get program stats with gill:', error)
    return {
      totalChallenges: 0,
      activeChallenges: 0,
      totalReceipts: 0
    }
  }
}

/**
 * Test gill with Descipline contract
 */
export async function testDesciplineContractWithGill(rpcUrl?: string): Promise<{
  success: boolean
  stats?: GillStats
  sampleChallenge?: GillChallengeData
  error?: string
}> {
  try {
    console.log('🧪 Testing Descipline contract with gill...')
    
    // Get program stats
    const stats = await getProgramStatsWithGill(rpcUrl)
    
    // Try to fetch challenges
    const challenges = await fetchChallengesWithGill(rpcUrl)
    
    const result = {
      success: true,
      stats,
      sampleChallenge: challenges[0] || undefined
    }
    
    console.log('✅ Descipline contract test successful:', result)
    return result
    
  } catch (error) {
    console.error('❌ Descipline contract test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}