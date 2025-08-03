import React, { createContext, useContext, useMemo } from 'react'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useAnchorWallet } from '@/hooks/use-anchor-wallet'
import { useConnection } from '@/components/solana/solana-provider'
import { DESCIPLINE_CONFIG } from '@/utils/descipline/constants'
import { Descipline } from '@/utils/descipline/descipline'
import { IDL } from '@/utils/descipline/idl'

interface DesciplineContextType {
  program: Program<Descipline> | null
  programId: PublicKey
}

const DesciplineContext = createContext<DesciplineContextType>({
  program: null,
  programId: DESCIPLINE_CONFIG.PROGRAM_ID,
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
      console.log('🔄 Creating Anchor program for template architecture...')
      
      // Safely create program ID from constants
      const programId = DESCIPLINE_CONFIG.PROGRAM_ID
      console.log('✅ Program ID created:', programId.toString())
      
      // Create a dummy wallet for read-only operations
      const dummyWallet = {
        publicKey: programId, // Use the programId we just created
        signTransaction: () => Promise.reject(new Error('Read-only mode - no signing available')),
        signAllTransactions: () => Promise.reject(new Error('Read-only mode - no signing available')),
      }

      // Use anchor wallet if available, otherwise use dummy wallet
      const wallet = anchorWallet || dummyWallet

      // Create provider with React Native compatible setup
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: DESCIPLINE_CONFIG.DEFAULT_COMMITMENT }
      )

      // Create program - React Native compatible
      // For Anchor v0.31.1, we need to pass the IDL differently
      const program = new Program(
        IDL as any,
        programId,
        provider
      ) as Program<Descipline>
      
      const mode = anchorWallet ? 'full' : 'read-only'
      console.log(`✅ Descipline Program created successfully in ${mode} mode`)
      return program
      
    } catch (error: any) {
      console.error('❌ Failed to create Anchor program:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return null
    }
  }, [connection, anchorWallet])

  const value = useMemo(
    () => ({
      program,
      programId: DESCIPLINE_CONFIG.PROGRAM_ID,
    }),
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