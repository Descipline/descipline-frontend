/**
 * Mobile-specific program utilities
 * Provides direct access to Descipline program without IDL parsing issues
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { BorshCoder, BN } from '@coral-xyz/anchor'
import { DESCIPLINE_CONFIG, getDesciplinePublicKeys } from './constants'

// Types
export interface ChallengeAccount {
  initiator: PublicKey
  name: string
  credentialPda: PublicKey
  schemaPda: PublicKey
  stakeMint: PublicKey
  tokenAllowed: { wsol?: {} } | { usdc?: {} }
  stakeAmount: BN
  totalStaked: BN
  fee: number
  stakeEndAt: BN
  claimStartFrom: BN
  nonce: number
}

export interface ChallengeWithPubkey {
  publicKey: PublicKey
  account: ChallengeAccount
}

/**
 * Fetches all challenges without using Anchor's IDL parsing
 * This avoids the "Type not found" error in React Native
 */
export async function fetchAllChallenges(connection: Connection): Promise<ChallengeWithPubkey[]> {
  try {
    console.log('📱 Fetching challenges using mobile-friendly method...')
    
    // Get program ID lazily to avoid BN initialization errors
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(
      PROGRAM_ID,
      {
        filters: [
          // Challenge accounts have a specific size
          { dataSize: 200 } // Adjust based on your Challenge account size
        ]
      }
    )

    console.log(`📱 Found ${accounts.length} program accounts`)

    // Parse accounts manually
    const challenges: ChallengeWithPubkey[] = []
    
    for (const { pubkey, account } of accounts) {
      try {
        // Skip if account data is too small
        if (account.data.length < 8) continue
        
        // Check discriminator (first 8 bytes)
        // You'll need to replace this with your actual Challenge discriminator
        const discriminator = account.data.slice(0, 8)
        
        // Basic parsing - you'll need to implement proper deserialization
        // based on your Challenge account structure
        const challenge: ChallengeWithPubkey = {
          publicKey: pubkey,
          account: {
            initiator: new PublicKey(account.data.slice(8, 40)),
            name: 'Challenge', // Parse from data
            credentialPda: new PublicKey(account.data.slice(40, 72)),
            schemaPda: new PublicKey(account.data.slice(72, 104)),
            stakeMint: new PublicKey(account.data.slice(104, 136)),
            tokenAllowed: { usdc: {} }, // Parse from data
            stakeAmount: new BN(0), // Parse from data
            totalStaked: new BN(0), // Parse from data
            fee: 0, // Parse from data
            stakeEndAt: new BN(0), // Parse from data
            claimStartFrom: new BN(0), // Parse from data
            nonce: 0 // Parse from data
          }
        }
        
        challenges.push(challenge)
      } catch (err) {
        console.warn('📱 Failed to parse account:', pubkey.toString(), err)
      }
    }
    
    console.log(`📱 Successfully parsed ${challenges.length} challenges`)
    return challenges
    
  } catch (error) {
    console.error('📱 Error fetching challenges:', error)
    throw error
  }
}

/**
 * Alternative: Use a simple RPC call to get challenge data
 */
export async function fetchChallengesViaRPC(connection: Connection): Promise<any[]> {
  try {
    // Get program ID lazily to avoid BN initialization errors
    const { PROGRAM_ID } = getDesciplinePublicKeys()
    
    const response = await fetch(connection.rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [
          PROGRAM_ID.toString(),
          {
            encoding: 'jsonParsed',
            filters: []
          }
        ]
      })
    })
    
    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error('📱 RPC error:', error)
    throw error
  }
}