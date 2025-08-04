import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { ChallengeStatus } from './challenge-status-badge'

interface UserParticipation {
  isParticipant: boolean
  stakeAmount?: number
  canClaim?: boolean
  hasClaimed?: boolean
  isWinner?: boolean
  participationTime?: Date
}

interface UserParticipationCardProps {
  userParticipation: UserParticipation | null
  challengeStatus: ChallengeStatus
  tokenSymbol: string
  decimals: number
  onJoinChallenge: () => void
  onClaimReward: () => void
  isLoading: boolean
}

export function UserParticipationCard({
  userParticipation,
  challengeStatus,
  tokenSymbol,
  decimals,
  onJoinChallenge,
  onClaimReward,
  isLoading
}: UserParticipationCardProps) {
  const formatAmount = (amount: number) => {
    const decimalPlaces = decimals === 9 ? 4 : 2 // SOL shows 4 decimals, USDC shows 2
    return `${(amount / Math.pow(10, decimals)).toFixed(decimalPlaces)} ${tokenSymbol}`
  }

  const getParticipationStatus = () => {
    if (!userParticipation || !userParticipation.isParticipant) {
      return {
        title: '🔗 Join Challenge',
        subtitle: 'Stake tokens to participate in this challenge',
        icon: 'link',
        color: SolanaColors.brand.purple,
        showAction: challengeStatus === ChallengeStatus.ACTIVE,
        actionText: 'Join Challenge',
        actionHandler: onJoinChallenge
      }
    }

    if (userParticipation.canClaim && !userParticipation.hasClaimed) {
      return {
        title: '🎉 Congratulations!',
        subtitle: userParticipation.isWinner ? 'You won! Claim your reward now.' : 'You can claim your reward',
        icon: 'trophy.fill',
        color: '#10b981',
        showAction: true,
        actionText: 'Claim Reward',
        actionHandler: onClaimReward
      }
    }

    if (userParticipation.hasClaimed) {
      return {
        title: '✅ Reward Claimed',
        subtitle: 'You have successfully claimed your reward',
        icon: 'checkmark.circle.fill',
        color: '#10b981',
        showAction: false
      }
    }

    return {
      title: '⏳ Waiting for Results',
      subtitle: `Staked ${formatAmount(userParticipation.stakeAmount || 0)} - waiting for challenge resolution`,
      icon: 'clock.fill',
      color: '#f59e0b',
      showAction: false
    }
  }

  const status = getParticipationStatus()

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <UiIconSymbol name={status.icon} size={24} color={status.color} />
          </View>
          <View style={styles.textContainer}>
            <AppText style={styles.title}>{status.title}</AppText>
            <AppText style={styles.subtitle}>{status.subtitle}</AppText>
          </View>
        </View>

        {status.showAction && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${status.color}20` }]}
            onPress={status.actionHandler}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[status.color, `${status.color}dd`]}
              style={styles.actionButtonGradient}
            />
            <AppText style={styles.actionButtonText}>
              {isLoading ? 'Processing...' : status.actionText}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})