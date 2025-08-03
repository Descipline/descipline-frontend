import React from 'react'
import { View, StyleSheet } from 'react-native'
import { AppText } from '@/components/app-text'
import { useWalletGuard } from '@/hooks/use-wallet-guard'

export default function CreateChallengeScreen() {
  // Protect this route - require wallet connection
  useWalletGuard()
  
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Create Challenge Page - Coming Soon</AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
  },
})