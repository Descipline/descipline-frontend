import React from 'react'
import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppView } from '@/components/app-view'
import { ChallengeFeature } from '@/components/descipline/challenge-feature'
import { SolanaColors } from '@/constants/colors'

export default function ChallengesScreen() {
  return (
    <AppView style={styles.container}>
      <LinearGradient
        colors={[SolanaColors.brand.dark, '#2a1a3a']}
        style={StyleSheet.absoluteFillObject}
      />
      <ChallengeFeature />
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})