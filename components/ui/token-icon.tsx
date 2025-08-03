import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
// @ts-ignore - react-native-crypto-icons may not have TypeScript definitions
import CryptoIcon from 'react-native-crypto-icons'
import { TokenAllowed } from '@/utils/descipline/types'

interface TokenIconProps {
  token: TokenAllowed | 'USDC' | 'SOL'
  size?: number
  color?: string
}

export function TokenIcon({ token, size = 20, color = '#ffffff' }: TokenIconProps) {
  // Normalize token name
  const normalizedToken = typeof token === 'string' ? token : 
    token === TokenAllowed.USDC ? 'USDC' : 'SOL'

  try {
    if (normalizedToken === 'USDC' || normalizedToken === TokenAllowed.USDC) {
      // USDC - display real USDC logo
      return (
        <CryptoIcon 
          name="usdc" 
          style={{ fontSize: size, color: color }} 
        />
      )
    } else {
      // SOL - display real Solana logo  
      return (
        <CryptoIcon 
          name="sol" 
          style={{ fontSize: size, color: color }} 
        />
      )
    }
  } catch (error) {
    // Fallback to Material Icons if crypto-icons fails to load
    console.warn('Crypto icons failed to load, using fallback icons:', error)
    if (normalizedToken === 'USDC' || normalizedToken === TokenAllowed.USDC) {
      return <MaterialIcons name="attach-money" size={size} color={color} />
    } else {
      return <MaterialIcons name="wb-sunny" size={size} color={color} />
    }
  }
}