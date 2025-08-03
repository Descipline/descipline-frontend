import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { ChallengeList } from '@/components/descipline/challenge-list'
import { useRouter } from 'expo-router'
import { SolanaColors } from '@/constants/colors'

export function ChallengeFeature() {
  const router = useRouter()

  return (
    <AppView style={styles.container}>
      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionBarLeft}>
          <AppText style={styles.sectionTitle}>All Challenges</AppText>
          <AppText style={styles.sectionSubtitle}>Discover and join active challenges</AppText>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/challenges/create')}
          style={styles.createButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[SolanaColors.brand.purple, '#dc1fff']}
            style={styles.createButtonGradient}
          />
          <AppText style={styles.createButtonIcon}>➕</AppText>
          <AppText style={styles.createButtonText}>Create Challenge</AppText>
        </TouchableOpacity>
      </View>
      
      <ChallengeList />
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBarLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    overflow: 'hidden',
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  createButtonIcon: {
    color: '#ffffff',
    fontSize: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})