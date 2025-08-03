import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'

interface ChallengeParticipant {
  address: string
  stakeAmount: number
  participationTime: Date
  isWinner?: boolean
  hasClaimed?: boolean
}

interface ParticipantsListProps {
  participants: ChallengeParticipant[]
  tokenSymbol: string
  decimals: number
  currentUserAddress?: string
}

export function ParticipantsList({
  participants,
  tokenSymbol,
  decimals,
  currentUserAddress
}: ParticipantsListProps) {
  const formatAmount = (amount: number) => {
    return `${(amount / Math.pow(10, decimals)).toFixed(2)} ${tokenSymbol}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const formatTime = (time: Date) => {
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (participants.length === 0) {
    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <AppText style={styles.sectionTitle}>👥 Participants</AppText>
          <View style={styles.emptyState}>
            <UiIconSymbol name="person.2" size={48} color="rgba(255, 255, 255, 0.3)" />
            <AppText style={styles.emptyTitle}>No participants yet</AppText>
            <AppText style={styles.emptySubtitle}>Be the first to join this challenge!</AppText>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText style={styles.sectionTitle}>👥 Participants</AppText>
          <AppText style={styles.participantCount}>{participants.length}</AppText>
        </View>

        <View style={styles.participantsList}>
          {participants.map((participant, index) => {
            const isCurrentUser = participant.address === currentUserAddress
            
            return (
              <View key={participant.address} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantHeader}>
                    <View style={styles.avatarContainer}>
                      <LinearGradient
                        colors={isCurrentUser ? [SolanaColors.brand.purple, '#dc1fff'] : ['#374151', '#6b7280']}
                        style={styles.avatar}
                      >
                        <AppText style={styles.avatarText}>
                          {participant.address.slice(0, 2).toUpperCase()}
                        </AppText>
                      </LinearGradient>
                    </View>
                    
                    <View style={styles.participantDetails}>
                      <View style={styles.addressRow}>
                        <AppText style={styles.participantAddress}>
                          {formatAddress(participant.address)}
                        </AppText>
                        {isCurrentUser && (
                          <View style={styles.youBadge}>
                            <AppText style={styles.youBadgeText}>YOU</AppText>
                          </View>
                        )}
                        {participant.isWinner && (
                          <View style={styles.winnerBadge}>
                            <UiIconSymbol name="trophy.fill" size={12} color="#fbbf24" />
                            <AppText style={styles.winnerBadgeText}>Winner</AppText>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.participantStats}>
                        <AppText style={styles.stakeAmount}>
                          {formatAmount(participant.stakeAmount)}
                        </AppText>
                        <AppText style={styles.participationTime}>
                          {formatTime(participant.participationTime)}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {participant.hasClaimed && (
                    <View style={styles.claimedBadge}>
                      <UiIconSymbol name="checkmark.circle.fill" size={14} color="#10b981" />
                      <AppText style={styles.claimedText}>Claimed</AppText>
                    </View>
                  )}
                </View>

                {index < participants.length - 1 && <View style={styles.separator} />}
              </View>
            )
          })}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '600',
    color: SolanaColors.brand.purple,
    backgroundColor: `${SolanaColors.brand.purple}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsList: {
    gap: 0,
  },
  participantItem: {
    paddingVertical: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  participantDetails: {
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  participantAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  youBadge: {
    backgroundColor: SolanaColors.brand.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf2420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  winnerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fbbf24',
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stakeAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  participationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
})