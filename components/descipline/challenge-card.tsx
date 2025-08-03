import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { SolanaColors } from '@/constants/colors'
import { GillChallengeData } from '@/utils/descipline/gill-challenge-reader'

interface ChallengeCardProps {
  challenge: GillChallengeData
  onPress?: () => void
}

export function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const formatAmount = (amount: string) => {
    const num = parseInt(amount)
    const decimals = challenge.tokenAllowed === 'USDC' ? 1000000 : 1000000000 // USDC 6 decimals, SOL 9 decimals
    return (num / decimals).toFixed(challenge.tokenAllowed === 'USDC' ? 2 : 4)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString()
  }

  const getStatus = () => {
    const now = Date.now() / 1000
    const stakeEnd = parseInt(challenge.stakeEndAt)
    const claimStart = parseInt(challenge.claimStartFrom)
    
    if (now > stakeEnd) {
      return { text: 'ENDED', color: '#f59e0b', emoji: '⏰' }
    }
    if (now >= claimStart) {
      return { text: 'CLAIMABLE', color: '#10b981', emoji: '✅' }
    }
    return { text: 'ACTIVE', color: '#10b981', emoji: '🔥' }
  }

  const status = getStatus()
  const tokenSymbol = challenge.tokenAllowed === 'USDC' ? 'USDC' : 'SOL'
  const stakeAmount = formatAmount(challenge.stakeAmount)
  const totalStaked = formatAmount(challenge.totalStaked)

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.challengeCard}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.cardGradient}
      />
      
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <AppText style={styles.trophyIcon}>🏆</AppText>
          </View>
          <AppText style={styles.challengeName} numberOfLines={1}>
            {challenge.name}
          </AppText>
        </View>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: `${status.color}20`,
            borderColor: `${status.color}40`,
          }
        ]}>
          <AppText style={[styles.statusText, { color: status.color }]}>
            {status.emoji} {status.text}
          </AppText>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <AppText style={styles.statIcon}>💰</AppText>
          <AppText style={styles.statLabel}>Stake</AppText>
          <AppText style={styles.statValue}>
            {stakeAmount} {tokenSymbol}
          </AppText>
        </View>
        
        <View style={styles.statItem}>
          <AppText style={styles.statIcon}>👥</AppText>
          <AppText style={styles.statLabel}>Participants</AppText>
          <AppText style={styles.statValue}>{challenge.participantCount}</AppText>
        </View>
        
        <View style={styles.statItem}>
          <AppText style={styles.statIcon}>💎</AppText>
          <AppText style={styles.statLabel}>Total Pool</AppText>
          <AppText style={styles.statValue}>
            {totalStaked} {tokenSymbol}
          </AppText>
        </View>
      </View>

      {/* Footer Row */}
      <View style={styles.cardFooter}>
        <View style={styles.timeInfo}>
          <AppText style={styles.footerIcon}>🕒</AppText>
          <AppText style={styles.footerText}>
            Ends: {formatDate(challenge.stakeEndAt)}
          </AppText>
        </View>
        <View style={styles.feeInfo}>
          <AppText style={styles.footerIcon}>%</AppText>
          <AppText style={styles.footerText}>{challenge.fee / 100}% fee</AppText>
        </View>
      </View>

      {/* Hover Effect Overlay */}
      <View style={styles.hoverOverlay} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  challengeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 16,
    color: SolanaColors.brand.purple,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
})