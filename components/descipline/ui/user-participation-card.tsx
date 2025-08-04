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
    return `${(amount / Math.pow(10, decimals)).toFixed(2)} ${tokenSymbol}`
  }

  // Not participated yet
  if (!userParticipation?.isParticipant) {
    if (challengeStatus === ChallengeStatus.ACTIVE) {
      return (
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)']}
            style={styles.gradient}
          />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <UiIconSymbol name="plus.circle.fill" size={24} color={SolanaColors.brand.purple} />
              </View>
              <View style={styles.headerText}>
                <AppText style={styles.title}>🎯 Join Challenge</AppText>
                <AppText style={styles.subtitle}>Participate and compete for rewards</AppText>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={onJoinChallenge}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <UiIconSymbol name="trophy.fill" size={16} color="#ffffff" />
              <AppText style={styles.buttonText}>
                {isLoading ? 'Joining...' : 'Join Now'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    
    // Challenge ended, user didn't participate
    return (
      <View style={[styles.card, styles.inactiveCard]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, styles.inactiveIcon]}>
              <UiIconSymbol name="clock.fill" size={24} color="rgba(255, 255, 255, 0.5)" />
            </View>
            <View style={styles.headerText}>
              <AppText style={[styles.title, styles.inactiveText]}>❌ Not Participated</AppText>
              <AppText style={styles.subtitle}>Challenge has ended</AppText>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // User has participated
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, styles.participatedIcon]}>
            <UiIconSymbol name="checkmark.circle.fill" size={24} color={SolanaColors.brand.green} />
          </View>
          <View style={styles.headerText}>
            <AppText style={styles.title}>✅ Participated</AppText>
            <AppText style={styles.subtitle}>
              Staked: {userParticipation.stakeAmount ? formatAmount(userParticipation.stakeAmount) : 'N/A'}
            </AppText>
          </View>
        </View>

        {/* Show participation details */}
        <View style={styles.detailsContainer}>
          {userParticipation.participationTime && (
            <View style={styles.detailRow}>
              <UiIconSymbol name="clock" size={14} color="rgba(255, 255, 255, 0.6)" />
              <AppText style={styles.detailText}>
                Joined {userParticipation.participationTime.toLocaleDateString()}
              </AppText>
            </View>
          )}
          
          {userParticipation.isWinner && (
            <View style={styles.detailRow}>
              {/* <UiIconSymbol name="crown.fill" size={14} color="#fbbf24" /> */}
              <AppText style={[styles.detailText, { color: '#fbbf24' }]}>
                🏆 Winner
              </AppText>
            </View>
          )}
        </View>

        {/* Action buttons based on status */}
        {userParticipation.canClaim && !userParticipation.hasClaimed && (
          <TouchableOpacity
            style={[styles.actionButton, styles.claimButton]}
            onPress={onClaimReward}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {/* <UiIconSymbol name="gift.fill" size={16} color="#ffffff" /> */}
            <AppText style={styles.buttonText}>
              {isLoading ? 'Claiming...' : '💰 Claim Reward'}
            </AppText>
          </TouchableOpacity>
        )}

        {userParticipation.hasClaimed && (
          <View style={[styles.actionButton, styles.claimedButton]}>
            <UiIconSymbol name="checkmark.circle.fill" size={16} color={SolanaColors.brand.green} />
            <AppText style={[styles.buttonText, { color: SolanaColors.brand.green }]}>
              ✅ Reward Claimed
            </AppText>
          </View>
        )}

        {challengeStatus === ChallengeStatus.ENDED && !userParticipation.canClaim && (
          <View style={[styles.actionButton, styles.waitingButton]}>
            <UiIconSymbol name="hourglass" size={16} color="rgba(255, 255, 255, 0.6)" />
            <AppText style={[styles.buttonText, { color: 'rgba(255, 255, 255, 0.6)' }]}>
              ⏳ Awaiting Results
            </AppText>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 24,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${SolanaColors.brand.purple}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  participatedIcon: {
    backgroundColor: `${SolanaColors.brand.green}20`,
  },
  inactiveIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  inactiveText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: SolanaColors.brand.purple,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  claimButton: {
    backgroundColor: SolanaColors.brand.green,
    shadowColor: SolanaColors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  claimedButton: {
    backgroundColor: `${SolanaColors.brand.green}20`,
    borderWidth: 1,
    borderColor: SolanaColors.brand.green,
  },
  waitingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})