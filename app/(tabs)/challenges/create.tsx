import React from 'react'
import { ChallengeCreateEnhanced } from '@/components/descipline/challenge/challenge-create-enhanced'
import { useWalletGuard } from '@/hooks/use-wallet-guard'

export default function CreateChallengeScreen() {
  // Protect this route - require wallet connection
  useWalletGuard()
  
  return <ChallengeCreateEnhanced />
}