import React, { useMemo, useState, useLayoutEffect } from 'react'
import { ScrollView, RefreshControl, View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { 
  useGetChallengeWithGill,
  useCheckUserParticipationWithGill,
  useGetChallengeParticipantsWithGill
} from '@/components/descipline/use-gill-challenge-hooks'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useWalletGuard } from '@/hooks/use-wallet-guard'
import { useAuth } from '@/components/auth/auth-provider'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { ChallengeStatusBadge, ChallengeStatus } from '@/components/descipline/ui/challenge-status-badge'
import { UserParticipationCard } from '@/components/descipline/ui/user-participation-card'
import { ParticipantsList } from '@/components/descipline/ui/participants-list'
import { ActionConfirmationModal } from '@/components/descipline/ui/action-confirmation-modal'
import { TransactionProgressModal, TransactionStep } from '@/components/descipline/ui/transaction-progress-modal'
import { useStakeChallenge, useClaimReward } from '@/components/descipline/use-challenge-transactions'

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
  const navigation = useNavigation()

  // Hide tab bar for this screen
  useLayoutEffect(() => {
    const parent = navigation.getParent()
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      })
    }
    
    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: {
            backgroundColor: SolanaColors.brand.dark,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
          }
        })
      }
    }
  }, [navigation])
  
  const { 
    data: challenge, 
    isLoading, 
    error,
    refetch 
  } = useGetChallengeWithGill(id)
  
  // Check user participation
  const { data: hasParticipated } = useCheckUserParticipationWithGill(id)
  
  // Get real participants
  const { data: realParticipants } = useGetChallengeParticipantsWithGill(
    id, 
    challenge?.stakeAmount || '0'
  )

  // Modal states
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  
  // Transaction states
  const [transactionStep, setTransactionStep] = useState<TransactionStep>(TransactionStep.PREPARING)
  const [transactionSignature, setTransactionSignature] = useState<string>()
  const [transactionError, setTransactionError] = useState<string>()
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransactionMode, setCurrentTransactionMode] = useState<'stake' | 'claim'>('stake')
  const [currentRewardAmount, setCurrentRewardAmount] = useState<number | undefined>()

  // Transaction hooks
  const stakeMutation = useStakeChallenge()
  const claimMutation = useClaimReward()

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
    const tokenSymbol = 'USDC' // Currently hardcoded, should be derived from challenge.tokenAllowed
    const decimals = 6 // Currently hardcoded for USDC
    
    // Use real participants data from gill
    const participants: ChallengeParticipant[] = realParticipants?.map(p => ({
      address: p.address,
      stakeAmount: Number(p.stakeAmount),
      participationTime: p.participationTime,
      isWinner: false,
      hasClaimed: false
    })) || [
      // Fallback: always include initiator
      {
        address: challenge.initiator,
        stakeAmount: Number(challenge.stakeAmount),
        participationTime: new Date(Date.now() - 86400000),
        isWinner: false,
        hasClaimed: false
      }
    ]

    // Use real user participation check from gill
    const userParticipation: UserParticipation | null = account && hasParticipated ? {
      isParticipant: true,
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

  const handleTransactionProgress = (step: TransactionStep, data?: any) => {
    console.log('🎯 handleTransactionProgress:', step, data)
    setTransactionStep(step)
    
    if (data?.signature) {
      setTransactionSignature(data.signature)
    }
    
    if (data?.error) {
      setTransactionError(data.error)
    }
  }

  // Test function - simulate transaction progress demo
  const handleTestTransactionFlow = () => {
    console.log('🎯 Starting test transaction flow demo')
    
    setShowTransactionModal(true)
    setCurrentTransactionMode('stake')
    setTransactionError(undefined)
    setTransactionSignature(undefined)
    
    let currentStep = 0
    const steps = [
      TransactionStep.PREPARING,
      TransactionStep.SIGNING, 
      TransactionStep.SENDING,
      TransactionStep.CONFIRMING,
      TransactionStep.SUCCESS
    ]
    
    const progressDemo = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep]
        setTransactionStep(step)
        
        // Add mock signature at SENDING step
        if (step === TransactionStep.SENDING) {
          setTimeout(() => {
            setTransactionSignature('2NRo2EegWknenUuSfUrXGTH4kY68bCQXGjdFnwXEQJvgFprmsh8vKSqai4xc9MLXFuMdgPd8D2317TvW1f78L2Ue')
          }, 500)
        }
        
        currentStep++
        setTimeout(progressDemo, step === TransactionStep.CONFIRMING ? 3000 : 2000)
      }
    }
    
    progressDemo()
  }

  const handleJoinChallenge = () => {
    setShowStakeModal(true)
  }

  const handleClaimReward = () => {
    setShowClaimModal(true)
  }

  const handleStakeConfirm = async () => {
    if (!challenge) return
    
    console.log('🎯 handleStakeConfirm: Starting stake process')
    
    // Close confirmation modal first
    setShowStakeModal(false)
    console.log('🎯 handleStakeConfirm: Closed stake modal')
    
    // Reset transaction state
    setTransactionError(undefined)
    setTransactionSignature(undefined)
    setCurrentTransactionMode('stake')
    setCurrentRewardAmount(undefined)
    
    // Small delay to ensure first modal closes completely
    setTimeout(() => {
      setShowTransactionModal(true)
      console.log('🎯 handleStakeConfirm: Opened transaction modal after delay')
    }, 100)
    
    try {
      await stakeMutation.mutateAsync({
        challenge,
        onProgressUpdate: handleTransactionProgress
      })
      
      // Refresh data after successful transaction
      refetch()
    } catch (error) {
      // Error is already handled in the hook
      console.error('Stake transaction failed:', error)
    }
  }

  const handleClaimConfirm = async () => {
    if (!challenge) return
    
    console.log('🎯 handleClaimConfirm: Starting claim process')
    
    // Close confirmation modal first
    setShowClaimModal(false)
    console.log('🎯 handleClaimConfirm: Closed claim modal')
    
    // Reset transaction state
    setTransactionError(undefined)
    setTransactionSignature(undefined)
    setCurrentTransactionMode('claim')
    setCurrentRewardAmount(Number(challenge.stakeAmount))
    
    // Small delay to ensure first modal closes completely
    setTimeout(() => {
      setShowTransactionModal(true)
      console.log('🎯 handleClaimConfirm: Opened transaction modal after delay')
    }, 100)
    
    try {
      await claimMutation.mutateAsync({
        challenge,
        onProgressUpdate: handleTransactionProgress
      })
      
      refetch()
    } catch (error) {
      console.error('Claim transaction failed:', error)
    }
  }

  const handleTransactionClose = () => {
    setShowTransactionModal(false)
    // Optionally show success toast or navigate
    if (transactionStep === TransactionStep.SUCCESS) {
      // Show success feedback
    }
  }

  const handleTransactionRetry = () => {
    // Retry the last operation
    if (stakeMutation.isError) {
      handleStakeConfirm()
    } else if (claimMutation.isError) {
      handleClaimConfirm()
    }
  }

  const handleViewTransaction = () => {
    if (transactionSignature) {
      // Open blockchain explorer
      const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
      // Note: URL logging only, mobile browser opening not implemented
      console.log('View transaction:', explorerUrl)
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
          isLoading={stakeMutation.isPending || claimMutation.isPending}
        />

        {/* Test Section - Development Only */}
        <View style={styles.testSection}>
          <AppText style={styles.testSectionTitle}>🧪 Test Transaction Progress Modal</AppText>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestTransactionFlow}
          >
            <UiIconSymbol name="play.circle.fill" size={16} color="#ffffff" />
            <AppText style={styles.testButtonText}>Demo Complete Transaction Flow</AppText>
          </TouchableOpacity>
        </View>

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

      {/* Transaction Progress Modal */}
      <TransactionProgressModal
        visible={showTransactionModal}
        step={transactionStep}
        error={transactionError}
        signature={transactionSignature}
        onClose={handleTransactionClose}
        onRetry={handleTransactionRetry}
        onViewTransaction={handleViewTransaction}
        mode={currentTransactionMode}
        rewardAmount={currentRewardAmount}
      />

      {/* Stake Confirmation Modal */}
      {challenge && (
        <ActionConfirmationModal
          visible={showStakeModal}
          onClose={() => setShowStakeModal(false)}
          onConfirm={handleStakeConfirm}
          challenge={{...challenge, publicKey: id}}
          creatorAddress={challenge.initiator}
          loading={stakeMutation.isPending}
          realParticipantCount={challengeData?.participants.length}
          mode="stake"
        />
      )}

      {/* Claim Confirmation Modal */}
      {challenge && (
        <ActionConfirmationModal
          visible={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onConfirm={handleClaimConfirm}
          challenge={{...challenge, publicKey: id}}
          creatorAddress={challenge.initiator}
          loading={claimMutation.isPending}
          realParticipantCount={challengeData?.participants.length}
          mode="claim"
          rewardAmount={Number(challenge.stakeAmount)}
          isWinner={true}
        />
      )}
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

  // Test Section
  testSection: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  testSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffa500',
    marginBottom: 12,
    textAlign: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffa500',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
})