/**
 * Simple gill test following official examples
 */

import { createSolanaClient } from 'gill'

export async function testGillBasic() {
  try {
    console.log('🔧 Testing gill basic functionality...')
    
    // Create client for devnet
    const client = createSolanaClient({ 
      urlOrMoniker: 'devnet' 
    })
    
    // Test basic RPC call
    const slot = await client.rpc.getSlot().send()
    console.log('✅ Gill basic test successful, current slot:', slot)
    
    return { success: true, slot }
    
  } catch (error) {
    console.error('❌ Gill basic test failed:', error)
    return { success: false, error: error.message }
  }
}

export async function testGillProgramAccounts() {
  try {
    console.log('🔧 Testing gill program accounts...')
    
    const client = createSolanaClient({ 
      urlOrMoniker: 'devnet' 
    })
    
    // Use a well-known program ID for testing (Token program)
    const programId = '11111111111111111111111111111112' // System program
    
    const accounts = await client.rpc.getProgramAccounts(
      programId as any,
      { encoding: 'base64' }
    ).send()
    
    console.log('✅ Gill program accounts test successful, found:', accounts.length, 'accounts')
    
    return { success: true, accountCount: accounts.length }
    
  } catch (error) {
    console.error('❌ Gill program accounts test failed:', error)
    return { success: false, error: error.message }
  }
}