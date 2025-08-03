/**
 * Gill-based contract data reader
 * Alternative to Anchor for React Native compatibility
 */

import { PublicKey } from '@solana/web3.js'
import { createSolanaClient, address } from 'gill'
import { getDesciplinePublicKeys, DESCIPLINE_CONFIG } from './constants'

// Types for parsed data
export interface GillChallengeData {
  publicKey: string
  initiator: string
  name: string
  credentialPda: string
  schemaPda: string
  stakeMint: string
  tokenAllowed: 'USDC' | 'WSOL'
  stakeAmount: string // As string to avoid BN issues
  totalStaked: string
  fee: number
  stakeEndAt: string
  claimStartFrom: string
  nonce: number
}

export interface GillReceiptData {
  publicKey: string
  challenger: string
  challenge: string
  bump: number
  timestamp?: number
}

/**
 * Fetch all challenges using gill library
 */
export async function fetchChallengesWithGill(rpcUrl: string): Promise<GillChallengeData[]> {
  try {
    console.log('🔧 Fetching challenges using gill library...')
    
    // Create gill client
    const client = createSolanaClient({ 
      urlOrMoniker: rpcUrl 
    })
    
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    console.log('🔧 Gill program address:', programAddress)
    
    // Use gill's RPC to get program accounts
    const response = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: [
          // Filter for Challenge accounts (adjust dataSize as needed)
          { dataSize: 200 } // Estimated challenge account size
        ]
      }
    ).send()
    
    console.log(`🔧 Gill found ${response.length} program accounts`)
    
    const challenges: GillChallengeData[] = []
    
    for (const accountInfo of response) {
      try {
        // Basic account data parsing
        const data = accountInfo.account.data
        
        if (Array.isArray(data) && data.length >= 2) {
          // gill returns data as [data, encoding]
          const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
          
          // Skip if too small (discriminator + minimal data)
          if (buffer.length < 50) continue
          
          // Parse account data manually (simplified version)
          const challenge: GillChallengeData = {
            publicKey: accountInfo.pubkey,
            initiator: 'TBD', // Parse from buffer
            name: 'Loading...', // Parse from buffer
            credentialPda: 'TBD',
            schemaPda: 'TBD',
            stakeMint: 'TBD',
            tokenAllowed: 'USDC',
            stakeAmount: '0',
            totalStaked: '0',
            fee: 0,
            stakeEndAt: '0',
            claimStartFrom: '0',
            nonce: 0
          }
          
          challenges.push(challenge)
        }
      } catch (error) {
        console.warn('🔧 Failed to parse account with gill:', accountInfo.pubkey, error)
      }
    }
    
    console.log(`✅ Gill successfully processed ${challenges.length} challenges`)
    return challenges
    
  } catch (error) {
    console.error('❌ Gill fetch error:', error)
    throw error
  }
}

/**
 * Fetch specific challenge account using gill
 */
export async function fetchChallengeWithGill(
  rpcUrl: string,
  challengePda: PublicKey
): Promise<GillChallengeData | null> {
  try {
    console.log('🔧 Fetching challenge with gill:', challengePda.toString())
    
    // Create gill client
    const client = createSolanaClient({ 
      urlOrMoniker: rpcUrl 
    })
    
    const challengeAddress = address(challengePda.toString())
    
    // Use gill's RPC to get account info
    const accountInfo = await client.rpc.getAccountInfo(
      challengeAddress,
      { encoding: 'base64' }
    ).send()
    
    if (!accountInfo.value) {
      console.log('🔧 Challenge not found')
      return null
    }
    
    // Parse account data
    const data = accountInfo.value.data
    
    if (Array.isArray(data) && data.length >= 2) {
      // Parse challenge data from buffer
      const buffer = Buffer.from(data[0], data[1] as BufferEncoding)
      
      const challenge: GillChallengeData = {
        publicKey: challengePda.toString(),
        initiator: 'TBD', // Parse from data
        name: 'Challenge', // Parse from data
        credentialPda: 'TBD',
        schemaPda: 'TBD',
        stakeMint: 'TBD',
        tokenAllowed: 'USDC',
        stakeAmount: '0',
        totalStaked: '0',
        fee: 0,
        stakeEndAt: '0',
        claimStartFrom: '0',
        nonce: 0
      }
      
      console.log('✅ Gill challenge fetch successful')
      return challenge
    }
    
    console.warn('🔧 Unexpected data format from gill')
    return null
    
  } catch (error) {
    console.error('❌ Gill challenge fetch error:', error)
    return null
  }
}

/**
 * Fetch receipts for a challenge using gill
 */
export async function fetchReceiptsWithGill(
  connection: Connection,
  challengePda: PublicKey
): Promise<GillReceiptData[]> {
  try {
    console.log('🔧 Fetching receipts with gill for challenge:', challengePda.toString())
    
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    
    // Get all receipt accounts
    const accounts = await gill.getProgramAccounts(connection, PROGRAM_ID, {
      encoding: 'base64',
      filters: [
        // Filter for Receipt accounts (smaller size)
        { dataSize: 50 } // Estimated receipt account size
      ]
    })
    
    console.log(`🔧 Gill found ${accounts.length} potential receipt accounts`)
    
    const receipts: GillReceiptData[] = []
    
    for (const account of accounts) {
      try {
        // Parse receipt data
        const data = account.account.data
        
        if (typeof data === 'string') {
          const buffer = Buffer.from(data, 'base64')
          
          // Basic parsing - you'll need to implement proper deserialization
          const receipt: GillReceiptData = {
            publicKey: account.pubkey,
            challenger: 'TBD', // Parse from buffer
            challenge: challengePda.toString(),
            bump: 0 // Parse from buffer
          }
          
          receipts.push(receipt)
        }
      } catch (error) {
        console.warn('🔧 Failed to parse receipt with gill:', account.pubkey, error)
      }
    }
    
    console.log(`✅ Gill processed ${receipts.length} receipts`)
    return receipts
    
  } catch (error) {
    console.error('❌ Gill receipts fetch error:', error)
    return []
  }
}

/**
 * Test gill connection and basic functionality
 */
export async function testGillConnection(rpcUrl: string): Promise<boolean> {
  try {
    console.log('🔧 Testing gill connection...')
    
    // Create gill client
    const client = createSolanaClient({ 
      urlOrMoniker: rpcUrl 
    })
    
    // Test basic RPC call
    const slot = await client.rpc.getSlot().send()
    console.log('🔧 Current slot:', slot)
    
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    const programAddress = address(PROGRAM_ID.toString())
    
    // Simple test: get program account count
    const accounts = await client.rpc.getProgramAccounts(
      programAddress,
      {
        encoding: 'base64',
        filters: []
      }
    ).send()
    
    console.log(`✅ Gill test successful - found ${accounts.length} total program accounts`)
    
    // Test individual account fetch if any exist
    if (accounts.length > 0) {
      const firstAccountAddress = address(accounts[0].pubkey)
      const accountInfo = await client.rpc.getAccountInfo(
        firstAccountAddress,
        { encoding: 'base64' }
      ).send()
      
      if (accountInfo.value) {
        console.log('✅ Gill individual account fetch successful')
        return true
      }
    }
    
    console.log('✅ Gill basic connection test passed')
    return true
    
  } catch (error) {
    console.error('❌ Gill connection test failed:', error)
    return false
  }
}

/**
 * Get challenge statistics using gill
 */
export async function getChallengeStatsWithGill(rpcUrl: string): Promise<{
  totalChallenges: number
  activeChallenges: number
  totalReceipts: number
}> {
  try {
    console.log('🔧 Getting challenge statistics with gill...')
    
    // Create gill client
    const client = createSolanaClient({ 
      urlOrMoniker: rpcUrl 
    })
    
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
    
    // Rough categorization based on account size
    const challenges = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size > 150 // Challenge accounts are larger
      }
      return false
    })
    
    const receipts = allAccounts.filter(acc => {
      if (Array.isArray(acc.account.data) && acc.account.data.length >= 2) {
        const size = Buffer.from(acc.account.data[0], acc.account.data[1] as BufferEncoding).length
        return size < 100 && size > 20 // Receipt accounts are smaller
      }
      return false
    })
    
    const stats = {
      totalChallenges: challenges.length,
      activeChallenges: challenges.length, // Would need proper parsing to determine active
      totalReceipts: receipts.length
    }
    
    console.log('✅ Gill statistics:', stats)
    return stats
    
  } catch (error) {
    console.error('❌ Gill statistics error:', error)
    return {
      totalChallenges: 0,
      activeChallenges: 0,
      totalReceipts: 0
    }
  }
}