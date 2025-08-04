import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { CreateChallengeFormData } from '@/utils/descipline/types'
import Clipboard from '@react-native-clipboard/clipboard'

interface ChallengeSuccessEnhancedProps {
  transactionResult: {
    challengePda: string
    signature: string
    challengeData: any
  }
  formData: CreateChallengeFormData
}

export function ChallengeSuccessEnhanced({ 
  transactionResult, 
  formData 
}: ChallengeSuccessEnhancedProps) {
  const router = useRouter()

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewChallenge = () => {
    // Navigate to challenges list since the challenge doesn't actually exist yet
    // (current implementation is placeholder)
    router.push('/(tabs)/challenges')
  }

  const handleCreateAnother = () => {
    // Navigate back to create page
    router.push('/(tabs)/challenges/create')
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text)
      // Native clipboard feedback will be shown automatically
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleViewAllChallenges = () => {
    // Navigate to challenges list
    router.push('/(tabs)/challenges')
  }

  return (
    <View style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIconContainer}>
          <LinearGradient
            colors={['#10b981', '#34d399']}
            style={styles.successIconGradient}
          >
            <UiIconSymbol name="checkmark.circle.fill" size={64} color="#ffffff" />
          </LinearGradient>
        </View>
        
        <AppText style={styles.successTitle}>🎉 Challenge Created!</AppText>
        <AppText style={styles.successSubtitle}>
          Your challenge "{formData.name}" has been successfully created and is now live on the blockchain.
        </AppText>
      </View>

      {/* Challenge Summary Card */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.05)']}
          style={styles.summaryGradient}
        />
        
        <View style={styles.summaryHeader}>
          <UiIconSymbol name="info.circle.fill" size={20} color="#10b981" />
          <AppText style={styles.summaryHeaderText}>Challenge Details</AppText>
        </View>

        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Name</AppText>
            <AppText style={styles.summaryValue}>{formData.name}</AppText>
          </View>
          
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Stake Amount</AppText>
            <AppText style={styles.summaryValue}>
              {formData.stakeAmount} {formData.tokenType === 'usdc' ? 'USDC' : 'SOL'}
            </AppText>
          </View>
          
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Creator Fee</AppText>
            <AppText style={styles.summaryValue}>{(formData.fee / 100).toFixed(1)}%</AppText>
          </View>
          
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Staking Ends</AppText>
            <AppText style={styles.summaryValue}>{formatDateTime(formData.stakeEndAt)}</AppText>
          </View>
          
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>Claims Start</AppText>
            <AppText style={styles.summaryValue}>{formatDateTime(formData.claimStartFrom)}</AppText>
          </View>
        </View>
      </View>

      {/* Transaction Info */}
      <View style={styles.transactionCard}>
        <AppText style={styles.transactionTitle}>📋 Transaction Details</AppText>
        
        <View style={styles.transactionRow}>
          <AppText style={styles.transactionLabel}>Challenge ID</AppText>
          <View style={styles.transactionValueRow}>
            <AppText style={styles.transactionValue} numberOfLines={1}>
              {transactionResult.challengePda.slice(0, 8)}...{transactionResult.challengePda.slice(-8)}
            </AppText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(transactionResult.challengePda, 'Challenge ID')}
              activeOpacity={0.8}
            >
              <UiIconSymbol name="doc.on.doc" size={16} color={SolanaColors.brand.purple} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.transactionRow}>
          <AppText style={styles.transactionLabel}>Transaction</AppText>
          <View style={styles.transactionValueRow}>
            <AppText style={styles.transactionValue} numberOfLines={1}>
              {transactionResult.signature.slice(0, 8)}...{transactionResult.signature.slice(-8)}
            </AppText>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(transactionResult.signature, 'Transaction')}
              activeOpacity={0.8}
            >
              <UiIconSymbol name="doc.on.doc" size={16} color={SolanaColors.brand.purple} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewChallenge}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[SolanaColors.brand.purple, '#dc1fff']}
            style={styles.primaryButtonGradient}
          />
          <UiIconSymbol name="list.bullet" size={20} color="#ffffff" />
          <AppText style={styles.primaryButtonText}>View Challenges</AppText>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCreateAnother}
            activeOpacity={0.8}
          >
            <UiIconSymbol name="plus.circle" size={16} color={SolanaColors.brand.purple} />
            <AppText style={styles.secondaryButtonText}>Create Another</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewAllChallenges}
            activeOpacity={0.8}
          >
            <UiIconSymbol name="list.bullet" size={16} color={SolanaColors.brand.purple} />
            <AppText style={styles.secondaryButtonText}>All Challenges</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <AppText style={styles.nextStepsTitle}>What's Next?</AppText>
        <View style={styles.nextStepsList}>
          <View style={styles.nextStepItem}>
            <UiIconSymbol name="1.circle.fill" size={16} color="#10b981" />
            <AppText style={styles.nextStepText}>Share your challenge with the community</AppText>
          </View>
          <View style={styles.nextStepItem}>
            <UiIconSymbol name="2.circle.fill" size={16} color="#10b981" />
            <AppText style={styles.nextStepText}>Monitor participants as they join</AppText>
          </View>
          <View style={styles.nextStepItem}>
            <UiIconSymbol name="3.circle.fill" size={16} color="#10b981" />
            <AppText style={styles.nextStepText}>Resolve the challenge when staking ends</AppText>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 32,
  },
  
  // Success Header
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 20,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Summary Card
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  summaryGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  summaryHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  transactionLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  transactionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  transactionValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
  },

  // Action Buttons
  actionButtons: {
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    overflow: 'hidden',
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  primaryButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SolanaColors.brand.purple,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SolanaColors.brand.purple,
  },

  // Next Steps
  nextStepsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextStepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    lineHeight: 20,
  },
})