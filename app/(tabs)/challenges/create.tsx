import React from 'react'
import { View } from 'react-native'
import { useWalletGuard } from '@/hooks/use-wallet-guard'

export default function CreateChallengeScreen() {
  useWalletGuard()
  
  return <View style={{ flex: 1, backgroundColor: '#1a1a1a' }} />
}