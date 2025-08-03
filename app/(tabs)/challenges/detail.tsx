import React, { useMemo, useState } from 'react'
import { ScrollView, RefreshControl, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { useGetChallengeWithGill } from '@/components/descipline/use-gill-challenge-hooks'
import { useLocalSearchParams } from 'expo-router'
import { useWalletGuard } from '@/hooks/use-wallet-guard'
import { useAuth } from '@/components/auth/auth-provider'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { ChallengeStatusBadge, ChallengeStatus } from '@/components/descipline/ui/challenge-status-badge'
import { UserParticipationCard } from '@/components/descipline/ui/user-participation-card'
import { ParticipantsList } from '@/components/descipline/ui/participants-list'
import { ActionConfirmationModal } from '@/components/descipline/ui/action-confirmation-modal'

interface ChallengeParticipant {
  address: string
  stakeAmount: number
  participationTime: Date
  isWinner?: boolean
  hasClaimed?: boolean
}

interface UserParticipation {
  isParticipant: boolean
  stakeAmount?: number
  canClaim?: boolean
  hasClaimed?: boolean
  isWinner?: boolean
  participationTime?: Date
}

interface DetailItemProps {
  icon: string
  label: string
  value: string
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <UiIconSymbol name={icon} size={16} color={SolanaColors.brand.purple} />
      </View>
      <View style={styles.detailContent}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <AppText style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  )
}

export default function ChallengeDetailScreen() {
  useWalletGuard()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { account } = useAuth()
  
  const { 
    data: challenge, 
    isLoading, 
    error,
    refetch 
  } = useGetChallengeWithGill(id)

  // Modal states
  const [isStaking, setIsStaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)

  // Compute derived data
  const challengeData = useMemo(() => {
    if (!challenge) return null

    const endTime = new Date(Number(challenge.stakeEndAt) * 1000)
    const claimTime = new Date(Number(challenge.claimStartFrom) * 1000)
    const now = Date.now()
    
    // Determine challenge status
    let status: ChallengeStatus
    if (now < Number(challenge.stakeEndAt) * 1000) {
      status = ChallengeStatus.ACTIVE
    } else if (now < Number(challenge.claimStartFrom) * 1000) {
      status = ChallengeStatus.ENDED
    } else {
      status = ChallengeStatus.RESOLVED
    }

    const isCreator = account && challenge.initiator === account.publicKey.toString()
    const tokenSymbol = 'USDC' // TODO: Get from challenge data
    const decimals = 6 // TODO: Get from challenge data
    
    // Mock participants data - TODO: implement gill-based participant reading
    const participants: ChallengeParticipant[] = [
      {
        address: challenge.initiator,
        stakeAmount: Number(challenge.stakeAmount),
        participationTime: new Date(Date.now() - 86400000), // 1 day ago
        isWinner: false,
        hasClaimed: false
      }
    ]

    // Mock user participation - TODO: implement gill-based user participation check
    const userParticipation: UserParticipation | null = account ? {
      isParticipant: participants.some(p => p.address === account.publicKey.toString()),
      stakeAmount: Number(challenge.stakeAmount),
      canClaim: false,
      hasClaimed: false,
      isWinner: false,
      participationTime: new Date()
    } : null

    return {
      status,
      endTime,
      claimTime,
      isCreator,
      tokenSymbol,
      decimals,
      participants,
      userParticipation
    }
  }, [challenge, account])

  const formatAmount = (amount: number) => {
    return `${(amount / 1000000).toFixed(2)} USDC`
  }

  const formatTime = (time: Date) => {
    return time.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleJoinChallenge = () => {
    setShowStakeModal(true)
  }

  const handleClaimReward = () => {
    setShowClaimModal(true)
  }

  const handleStakeConfirm = async () => {
    setIsStaking(true)
    try {
      // TODO: Implement actual stake transaction using Anchor or Web3.js
      // For now, using mock delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowStakeModal(false)
      refetch()
    } catch (error) {
      console.error('Stake failed:', error)
    } finally {
      setIsStaking(false)
    }
  }

  const handleClaimConfirm = async () => {
    setIsClaiming(true)
    try {
      // TODO: Implement actual claim transaction using Anchor or Web3.js
      // For now, using mock delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowClaimModal(false)
      refetch()
    } catch (error) {
      console.error('Claim failed:', error)
    } finally {
      setIsClaiming(false)
    }
  }

  if (isLoading) {
    return (
      <AppView style={styles.container}>
        <LinearGradient
          colors={[SolanaColors.brand.dark, '#2a1a3a']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText}>Loading challenge...</AppText>
        </View>
      </AppView>
    )
  }

  if (error || !challenge || !challengeData) {
    return (
      <AppView style={styles.container}>
        <LinearGradient
          colors={[SolanaColors.brand.dark, '#2a1a3a']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>Failed to load challenge</AppText>
        </View>
      </AppView>
    )
  }

  return (
    <AppView style={styles.container}>
      <LinearGradient
        colors={[SolanaColors.brand.dark, '#2a1a3a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Challenge Header */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <AppText style={styles.challengeTitle}>{challenge.name}</AppText>
              <ChallengeStatusBadge status={challengeData.status} />
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <UiIconSymbol name="person.2.fill" size={16} color={SolanaColors.brand.purple} />
                <AppText style={styles.statText}>{challengeData.participants.length} participants</AppText>
              </View>
              <View style={styles.statItem}>
                <UiIconSymbol name="dollarsign.circle.fill" size={16} color="#fbbf24" />
                <AppText style={styles.statText}>{formatAmount(challengeData.participants.length * Number(challenge.stakeAmount))} total</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* User Participation Card */}
        <UserParticipationCard
          userParticipation={challengeData.userParticipation}
          challengeStatus={challengeData.status}
          tokenSymbol={challengeData.tokenSymbol}
          decimals={challengeData.decimals}
          onJoinChallenge={handleJoinChallenge}
          onClaimReward={handleClaimReward}
          isLoading={isStaking || isClaiming}
        />

        {/* Challenge Details */}
        <View style={styles.detailsCard}>
          <AppText style={styles.sectionTitle}>📋 Challenge Details</AppText>
          
          <View style={styles.detailsGrid}>
            <DetailItem
              icon="dollarsign.circle"
              label="Stake Amount"
              value={formatAmount(Number(challenge.stakeAmount))}
            />
            <DetailItem
              icon="star.fill"
              label="Creator Fee"
              value={`${challenge.fee / 100}%`}
            />
            <DetailItem
              icon="clock.fill"
              label="Stake Deadline"
              value={formatTime(challengeData.endTime)}
            />
            <DetailItem
              icon="checkmark.circle.fill"
              label="Claim Start"
              value={formatTime(challengeData.claimTime)}
            />
          </View>
        </View>

        {/* Creator Info */}
        <View style={styles.detailsCard}>
          <AppText style={styles.sectionTitle}>👑 Creator Info</AppText>
          
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <AppText style={styles.creatorAvatarText}>
                {challenge.initiator.slice(0, 2).toUpperCase()}
              </AppText>
            </View>
            <View style={styles.creatorDetails}>
              <AppText style={styles.creatorAddress}>
                {`${challenge.initiator.slice(0, 8)}...${challenge.initiator.slice(-8)}`}
              </AppText>
              {challengeData.isCreator && (
                <View style={styles.creatorBadge}>
                  <AppText style={styles.creatorBadgeText}>YOU</AppText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Participants List */}
        <ParticipantsList
          participants={challengeData.participants}
          tokenSymbol={challengeData.tokenSymbol}
          decimals={challengeData.decimals}
          currentUserAddress={account?.publicKey.toString()}
        />
      </ScrollView>

      {/* Stake Confirmation Modal */}
      <ActionConfirmationModal
        visible={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        onConfirm={handleStakeConfirm}
        challenge={challenge}
        creatorAddress={challenge.initiator}
        loading={isStaking}
        realParticipantCount={challengeData.participants.length}
        mode="stake"
      />

      {/* Claim Confirmation Modal */}
      <ActionConfirmationModal
        visible={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onConfirm={handleClaimConfirm}
        challenge={challenge}
        creatorAddress={challenge.initiator}
        loading={isClaiming}
        realParticipantCount={challengeData.participants.length}
        mode="claim"
        rewardAmount={Number(challenge.stakeAmount)} // Mock reward amount
        isWinner={true} // Mock winner status
      />
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  
  // Header Card
  headerCard: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Details Card
  detailsCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Creator Info
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SolanaColors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  creatorDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  creatorBadge: {
    backgroundColor: SolanaColors.brand.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  creatorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
})