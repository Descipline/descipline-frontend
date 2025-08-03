import React, { createContext, useContext, useMemo } from 'react'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useAnchorWallet } from '@/hooks/use-anchor-wallet'
import { useConnection } from '@/components/solana/solana-provider'
import { DESCIPLINE_CONFIG, getDesciplinePublicKeys } from '@/utils/descipline/constants'
import { Descipline } from '@/utils/descipline/descipline'
import { IDL } from '@/utils/descipline/idl'

interface DesciplineContextType {
  program: Program<Descipline> | null
  programId: PublicKey | null
}

// Initialize context with null to avoid early PublicKey creation
const DesciplineContext = createContext<DesciplineContextType>({
  program: null,
  programId: null,
})

export function DesciplineProvider({ children }: { children: React.ReactNode }) {
  console.log('🏗️ DesciplineProvider ENTRY - Using Template Mobile Wallet')
  
  const connection = useConnection()
  const anchorWallet = useAnchorWallet()
  
  const program = useMemo(() => {
    if (!connection) {
      console.log('❌ Descipline Provider: Missing connection')
      return null
    }

    try {
      console.log('🔄 Creating Anchor program for React Native...')
      
      // Wait for polyfills to be ready
      if (typeof global.Buffer === 'undefined') {
        console.error('❌ Buffer polyfill not ready')
        return null
      }
      
      if (typeof global.TextEncoder === 'undefined') {
        console.error('❌ TextEncoder polyfill not ready')
        return null
      }
      
      // Lazy initialize PublicKeys to avoid BN errors during module loading
      const publicKeys = getDesciplinePublicKeys()
      const programId = publicKeys.PROGRAM_ID
      console.log('✅ Program ID created lazily:', programId.toString())
      
      // Create a minimal dummy wallet for read-only operations
      // Use a different address to avoid confusion with program ID
      const dummyWallet = {
        publicKey: publicKeys.PLATFORM_ATTESTER, // Use a valid address
        signTransaction: () => Promise.reject(new Error('Read-only mode')),
        signAllTransactions: () => Promise.reject(new Error('Read-only mode')),
      }

      // Use the actual wallet if connected, otherwise dummy wallet
      const wallet = anchorWallet || dummyWallet

      // Create AnchorProvider with proper error handling
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { 
          commitment: DESCIPLINE_CONFIG.DEFAULT_COMMITMENT,
          preflightCommitment: 'confirmed',
          skipPreflight: false
        }
      )

      // Create Anchor program following 0.31.0 best practices
      // Based on Stack Overflow solutions: use newer Program constructor format
      const program = new Program(
        IDL,
        programId,
        provider
      ) as Program<Descipline>
      
      const mode = anchorWallet ? 'full-wallet' : 'read-only'
      console.log(`✅ Anchor Program initialized successfully in ${mode} mode`)
      console.log(`✅ Program address: ${programId.toString()}`)
      
      return program
      
    } catch (error: any) {
      console.error('❌ Failed to create Anchor program:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack?.slice(0, 500), // Limit stack trace length
        name: error.name
      })
      
      // Additional debugging for BN-specific errors
      if (error.message?.includes('_bn') || error.message?.includes('BN')) {
        console.error('❌ This appears to be a BN initialization error')
        console.error('❌ Check that all address strings in IDL are valid PublicKeys')
      }
      
      return null
    }
  }, [connection, anchorWallet])

  const value = useMemo(
    () => {
      // Lazy create programId to match the program creation pattern
      const publicKeys = getDesciplinePublicKeys()
      return {
        program,
        programId: publicKeys.PROGRAM_ID,
      }
    },
    [program]
  )

  return <DesciplineContext.Provider value={value}>{children}</DesciplineContext.Provider>
}

export function useDescipline() {
  const context = useContext(DesciplineContext)
  console.log('🎯 useDescipline called:', { 
    hasContext: !!context, 
    hasProgram: !!context?.program,
    programId: context?.programId?.toString()
  })
  
  if (!context) {
    console.error('❌ useDescipline: No context found - not within DesciplineProvider')
    throw new Error('useDescipline must be used within DesciplineProvider')
  }
  return context
}