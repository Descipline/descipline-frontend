import React, { useLayoutEffect } from 'react'
import { ChallengeCreateEnhanced } from '@/components/descipline/challenge/challenge-create-enhanced'
import { useWalletGuard } from '@/hooks/use-wallet-guard'
import { useNavigation } from 'expo-router'
import { SolanaColors } from '@/constants/colors'

export default function CreateChallengeScreen() {
  // Protect this route - require wallet connection
  useWalletGuard()
  const navigation = useNavigation()

  // Hide tab bar for this screen
  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    })
    
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: SolanaColors.brand.dark,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        }
      })
    }
  }, [navigation])
  
  return <ChallengeCreateEnhanced />
}