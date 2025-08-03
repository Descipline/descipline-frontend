/**
 * Gill-based Challenge Data Reader
 * Uses gill library to read Descipline contract data without Anchor's BN issues
 */

import { createSolanaClient, address } from 'gill'
import { getDesciplinePublicKeys } from './constants'
import { PublicKey } from '@solana/web3.js'

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
 * Parse challenge account data from buffer using manual parsing (React Native compatible)
 * Based on Challenge struct from IDL:
 * - name: string (4 bytes length + string data)
 * - initiator: pubkey (32 bytes)
 * - token_allowed: enum (1 byte)  
 * - stake_amount: u64 (8 bytes)
 * - fee: u16 (2 bytes)
 * - stake_end_at: i64 (8 bytes)
 * - claim_start_from: i64 (8 bytes)
 * - schema: pubkey (32 bytes)
 * - attestor: pubkey (32 bytes)
 * - bump: u8 (1 byte)
 */
function parseChallengeData(buffer: Buffer, publicKey: string): GillChallengeData | null {
  try {
    console.log(`🔍 Parsing challenge account ${publicKey.slice(0, 8)}: ${buffer.length} bytes`)
    
    // Basic validation - Challenge should be at least 100 bytes
    if (buffer.length < 100) {
      console.log(`⚠️ Account too small (${buffer.length} bytes), skipping`)
      return null
    }
    
    // Check discriminator first (8 bytes)
    const expectedDiscriminator = [119, 250, 161, 121, 119, 81, 22, 208] // From IDL
    const actualDiscriminator = Array.from(buffer.slice(0, 8))
    
    const discriminatorMatch = expectedDiscriminator.every((byte, i) => byte === actualDiscriminator[i])
    if (!discriminatorMatch) {
      console.log(`⚠️ Discriminator mismatch for ${publicKey.slice(0, 8)}:`)
      console.log(`  Expected: [${expectedDiscriminator.join(', ')}]`)
      console.log(`  Actual:   [${actualDiscriminator.join(', ')}]`)
      return null
    }
    
    console.log(`✅ Discriminator match for Challenge account ${publicKey.slice(0, 8)}`)
    
    // Manual parsing starting after discriminator (offset 8)
    let offset = 8
    
    // Parse name (string): 4 bytes length + string data
    const nameLength = buffer.readUInt32LE(offset)
    offset += 4
    const nameBytes = buffer.slice(offset, offset + nameLength)
    const name = nameBytes.toString('utf8')
    offset += nameLength
    
    // Parse initiator (32 bytes pubkey)
    const initiatorBytes = buffer.slice(offset, offset + 32)
    const initiator = new PublicKey(initiatorBytes).toString()
    offset += 32
    
    // Parse token_allowed (1 byte enum: 0 = WSOL, 1 = USDC)
    const tokenAllowedByte = buffer.readUInt8(offset)
    const tokenAllowed = tokenAllowedByte === 0 ? 'WSOL' : 'USDC'
    offset += 1
    
    // Parse stake_amount (8 bytes u64)
    const stakeAmount = buffer.readBigUInt64LE(offset).toString()
    offset += 8
    
    // Parse fee (2 bytes u16)
    const fee = buffer.readUInt16LE(offset)
    offset += 2
    
    // Parse stake_end_at (8 bytes i64)
    const stakeEndAt = buffer.readBigInt64LE(offset).toString()
    offset += 8
    
    // Parse claim_start_from (8 bytes i64)
    const claimStartFrom = buffer.readBigInt64LE(offset).toString()
    offset += 8
    
    // Parse schema (32 bytes pubkey)
    const schemaBytes = buffer.slice(offset, offset + 32)
    const schema = new PublicKey(schemaBytes).toString()
    offset += 32
    
    // Parse attestor (32 bytes pubkey)
    const attestorBytes = buffer.slice(offset, offset + 32)
    const attestor = new PublicKey(attestorBytes).toString()
    offset += 32
    
    // Parse bump (1 byte u8)
    const bump = buffer.readUInt8(offset)
    
    console.log(`🎯 Successfully manual parsed Challenge data:`, {
      name,
      initiator,
      tokenAllowed,
      stakeAmount,
      fee,
      stakeEndAt,
      claimStartFrom,
      schema,
      attestor,
      bump
    })
    
    // Convert to our interface format
    const challenge: GillChallengeData = {
      publicKey,
      initiator,
      name,
      credentialPda: schema, // Using schema as credential for now
      schemaPda: schema,
      stakeMint: tokenAllowed === 'USDC' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : 'So11111111111111111111111111111111111111112',
      tokenAllowed,
      stakeAmount,
      totalStaked: stakeAmount, // We don't track total staked in contract
      fee,
      stakeEndAt,
      claimStartFrom,
      nonce: bump,
      // Computed fields
      isActive: Date.now() / 1000 < parseInt(stakeEndAt),
      participantCount: 0 // Would need to fetch receipts separately
    }
    
    console.log(`✅ Manual parsed challenge: ${challenge.name} (${buffer.length} bytes)`)
    return challenge
    
  } catch (error) {
    console.error(`❌ Failed to manually parse challenge data for ${publicKey.slice(0, 8)}:`, error)
    console.error(`❌ Error details:`, error.message)
    return null
  }
}

/**
 * Fetch all challenges using gill (with dynamic size detection)
 */
export async function fetchChallengesWithGill(rpcUrl?: string): Promise<GillChallengeData[]> {
  try {
    console.log('🔧 Fetching challenges with gill...')
    
    const client = createGillClient(rpcUrl)
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    // First, get ALL accounts to detect actual challenge size
    const allAccounts = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: []
      }
    ).send()
    
    console.log(`🔧 Found ${allAccounts.length} total accounts, analyzing sizes...`)
    
    // Group by size to find the most likely challenge accounts
    const accountSizes = allAccounts.map(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return { ...acc, size }
      }
      return { ...acc, size: 0 }
    })
    
    // Find accounts that are likely to be challenges (larger than receipts)
    const sizeGroups = accountSizes.reduce((groups, acc) => {
      const size = acc.size
      if (!groups[size]) groups[size] = []
      groups[size].push(acc)
      return groups
    }, {} as Record<number, typeof accountSizes>)
    
    console.log('📊 Account sizes found:', Object.keys(sizeGroups).map(size => `${size} bytes: ${sizeGroups[parseInt(size)].length} accounts`))
    
    // Filter by Challenge discriminator first
    const challengeDiscriminator = [119, 250, 161, 121, 119, 81, 22, 208]
    const challengeCandidates = accountSizes.filter(acc => {
      if (acc.size < 100) return false // Too small for Challenge
      
      // Check discriminator
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const buffer = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding)
        if (buffer.length >= 8) {
          const actualDiscriminator = Array.from(buffer.slice(0, 8))
          return challengeDiscriminator.every((byte, i) => byte === actualDiscriminator[i])
        }
      }
      return false
    })
    
    console.log(`🔧 Found ${challengeCandidates.length} Challenge accounts (by discriminator)`)
    
    const challenges: GillChallengeData[] = []
    
    for (const account of challengeCandidates) {
      try {
        const data = account.account.data
        
        if (Array.isArray(data) && data.length >= 2) {
          const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
          
          console.log(`🔍 Analyzing account ${account.pubkey.slice(0, 8)}: ${buffer.length} bytes`)
          
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
          // Filter by exact Receipt account size (based on contract struct)  
          // Receipt: 8 (discriminator) + 1 (bump) = 9 bytes
          { dataSize: 9 } // Exact receipt size from contract
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
    
    // Debug: Log all account sizes to find the real challenge size
    const accountSizes = allAccounts.map(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return { pubkey: acc.pubkey.slice(0, 8), size }
      }
      return { pubkey: acc.pubkey.slice(0, 8), size: 0 }
    })
    
    console.log('🔍 All account sizes:', accountSizes)
    
    // Group by size to identify patterns
    const sizeGroups = accountSizes.reduce((groups, acc) => {
      const size = acc.size
      if (!groups[size]) groups[size] = []
      groups[size].push(acc.pubkey)
      return groups
    }, {} as Record<number, string[]>)
    
    console.log('📊 Account size groups:', sizeGroups)
    
    // Find the most likely challenge size (largest accounts, excluding very small ones)
    const sizeCounts = Object.entries(sizeGroups).map(([size, accounts]) => ({
      size: parseInt(size),
      count: accounts.length,
      accounts: accounts.slice(0, 3) // Show first 3 examples
    })).sort((a, b) => b.size - a.size)
    
    console.log('📈 Size analysis:', sizeCounts)
    
    // Assume largest accounts are challenges, smallest are receipts
    const largestSize = sizeCounts[0]?.size || 0
    const smallestSize = sizeCounts[sizeCounts.length - 1]?.size || 0
    
    const challenges = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size === largestSize && size > 50 // Challenges should be reasonably large
      }
      return false
    })
    
    const receipts = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size === smallestSize && size < 50 // Receipts should be small
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
    
    console.log('✅ Program stats (auto-detected sizes):', stats)
    console.log(`💡 Detected challenge size: ${largestSize} bytes, receipt size: ${smallestSize} bytes`)
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