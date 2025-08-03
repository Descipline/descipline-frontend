import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { AppText } from '@/components/app-text'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { ChallengeData } from '../use-gill-challenge-hooks'

interface UserChallengeCardProps {
  challenge: ChallengeData
}

export function UserChallengeCard({ challenge }: UserChallengeCardProps) {
  const handlePress = () => {
    router.push(`/challenges/detail?id=${challenge.publicKey}`)
  }

  // Format stake amount
  const stakeAmount = Number(challenge.stakeAmount) / 1000000 // Convert from lamports to USDC

  // Get challenge status
  const getStatusInfo = () => {
    const now = Date.now()
    const stakeEndTime = Number(challenge.stakeEndAt) * 1000
    const claimStartTime = Number(challenge.claimStartFrom) * 1000

    if (now < stakeEndTime) {
      return { status: 'Active', color: SolanaColors.brand.purple, icon: 'play.circle.fill' }
    } else if (now < claimStartTime) {
      return { status: 'Pending', color: '#f59e0b', icon: 'clock.fill' }
    } else {
      return { status: 'Completed', color: '#10b981', icon: 'checkmark.circle.fill' }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <AppText style={styles.challengeName} numberOfLines={1}>
              {challenge.name}
            </AppText>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <UiIconSymbol 
                name={statusInfo.icon} 
                size={12} 
                color={statusInfo.color} 
              />
              <AppText style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.status}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <UiIconSymbol name="dollarsign.circle" size={16} color="rgba(255, 255, 255, 0.6)" />
            <AppText style={styles.detailText}>${stakeAmount.toFixed(2)} USDC</AppText>
          </View>
          
          <View style={styles.detailItem}>
            <UiIconSymbol name="person.2" size={16} color="rgba(255, 255, 255, 0.6)" />
            <AppText style={styles.detailText}>{challenge.participantCount} participants</AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})