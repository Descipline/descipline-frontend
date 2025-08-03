import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { useConnection } from '@/components/solana/solana-provider'
import Clipboard from '@react-native-clipboard/clipboard'
import { Toast } from '@/components/ui/toast'

export enum TransactionStep {
  PREPARING = 'preparing',
  SIGNING = 'signing',
  SENDING = 'sending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error'
}

enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  FINALIZED = 'finalized'
}

interface TransactionProgressModalProps {
  visible: boolean
  step: TransactionStep
  error?: string
  signature?: string
  onClose: () => void
  onRetry?: () => void
  onViewTransaction?: () => void
  mode?: 'stake' | 'claim'
  rewardAmount?: number
}

export function TransactionProgressModal({
  visible,
  step,
  error,
  signature,
  onClose,
  onRetry,
  onViewTransaction,
  mode = 'stake',
  rewardAmount
}: TransactionProgressModalProps) {
  const connection = useConnection()
  const [txStatus, setTxStatus] = useState<TransactionStatus>(TransactionStatus.PENDING)
  const [confirmations, setConfirmations] = useState(0)
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, label: string) => {
    try {
      Clipboard.setString(text)
      setToastMessage(`${label} copied`)
      setToastVisible(true)
    } catch (error) {
      console.error('Copy failed:', error)
      setToastMessage(`Failed to copy ${label}`)
      setToastVisible(true)
    }
  }

  // Open explorer link
  const openExplorer = () => {
    if (!signature) return
    const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet-beta'
    const url = `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
    Linking.openURL(url)
  }

  // Poll transaction status when signature is available and step is SUCCESS
  useEffect(() => {
    if (!connection || !signature || step !== TransactionStep.SUCCESS) return

    let currentPollingAttempts = 0
    const maxPollingAttempts = 30
    let pollingTimeoutId: NodeJS.Timeout | null = null

    const pollTransactionStatus = async () => {
      try {
        currentPollingAttempts++
        
        // Get transaction status
        const status = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true
        })

        if (status.value === null) {
          // Transaction not found yet
          if (currentPollingAttempts < maxPollingAttempts) {
            pollingTimeoutId = setTimeout(pollTransactionStatus, 2000)
          } else {
            setTxStatus(TransactionStatus.FAILED)
          }
          return
        }

        if (status.value.err) {
          // Transaction failed
          setTxStatus(TransactionStatus.FAILED)
          return
        }

        // Transaction succeeded
        const confirmationStatus = status.value.confirmationStatus
        setConfirmations(status.value.confirmations || 0)

        if (confirmationStatus === 'processed') {
          setTxStatus(TransactionStatus.PENDING)
          pollingTimeoutId = setTimeout(pollTransactionStatus, 2000)
        } else if (confirmationStatus === 'confirmed') {
          setTxStatus(TransactionStatus.CONFIRMED)
          pollingTimeoutId = setTimeout(pollTransactionStatus, 3000)
        } else if (confirmationStatus === 'finalized') {
          setTxStatus(TransactionStatus.FINALIZED)
          // Stop polling when finalized
          return
        }
      } catch (error) {
        console.error('Error polling transaction:', error)
        if (currentPollingAttempts < maxPollingAttempts) {
          pollingTimeoutId = setTimeout(pollTransactionStatus, 3000)
        } else {
          setTxStatus(TransactionStatus.FAILED)
        }
      }
    }

    // Start polling
    pollTransactionStatus()

    // Cleanup function
    return () => {
      if (pollingTimeoutId) {
        clearTimeout(pollingTimeoutId)
      }
    }
  }, [connection, signature, step])
  const getStepInfo = () => {
    switch (step) {
      case TransactionStep.PREPARING:
        return {
          icon: 'gear',
          title: 'Preparing Transaction',
          message: 'Building transaction instructions...',
          color: SolanaColors.brand.purple,
          showProgress: true
        }
      case TransactionStep.SIGNING:
        return {
          icon: 'hand.raised.fill',
          title: 'Wallet Signature Required',
          message: 'Please approve the transaction in your wallet',
          color: '#f59e0b',
          showProgress: true
        }
      case TransactionStep.SENDING:
        return {
          icon: 'paperplane.fill',
          title: 'Sending Transaction',
          message: 'Broadcasting to Solana network...',
          color: SolanaColors.brand.purple,
          showProgress: true
        }
      case TransactionStep.CONFIRMING:
        return {
          icon: 'clock.fill',
          title: 'Confirming Transaction',
          message: 'Waiting for network confirmation...',
          color: SolanaColors.brand.purple,
          showProgress: true
        }
      case TransactionStep.SUCCESS:
        // Use transaction status for SUCCESS step
        return getSuccessStepInfo()
      case TransactionStep.ERROR:
        return {
          icon: 'xmark.circle.fill',
          title: 'Transaction Failed',
          message: error || 'An unexpected error occurred',
          color: '#ef4444',
          showProgress: false
        }
    }
  }

  const getSuccessStepInfo = () => {
    switch (txStatus) {
      case TransactionStatus.PENDING:
        return {
          icon: 'hourglass',
          title: 'Processing Transaction',
          message: 'Transaction is being processed...',
          color: '#f59e0b',
          showProgress: true
        }
      case TransactionStatus.CONFIRMED:
        return {
          icon: 'checkmark.circle.fill',
          title: 'Processing Transaction', 
          message: 'Transaction confirmed! Waiting for finalization...',
          color: '#10b981',
          showProgress: true
        }
      case TransactionStatus.FINALIZED:
        return {
          icon: 'checkmark.circle.fill',
          title: mode === 'claim' ? 'Reward Claimed!' : 'Welcome to the Challenge!',
          message: mode === 'claim' ? '🎉 Successfully claimed your reward!' : '🎉 Successfully joined the challenge!',
          color: SolanaColors.brand.green,
          showProgress: false
        }
      case TransactionStatus.FAILED:
        return {
          icon: 'xmark.circle.fill',
          title: 'Transaction Failed',
          message: 'Transaction failed or could not be confirmed',
          color: '#ef4444',
          showProgress: false
        }
      default:
        return {
          icon: 'hourglass',
          title: 'Processing Transaction',
          message: 'Checking transaction status...',
          color: '#f59e0b',
          showProgress: true
        }
    }
  }

  const stepInfo = getStepInfo()
  const canClose = step === TransactionStep.SUCCESS || step === TransactionStep.ERROR
  const isSuccess = step === TransactionStep.SUCCESS

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={canClose ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[SolanaColors.brand.dark, '#1a0b2e']}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Progress Circle */}
          <View style={[styles.iconContainer, { backgroundColor: `${stepInfo.color}20` }]}>
            <UiIconSymbol 
              name={stepInfo.icon} 
              size={48} 
              color={stepInfo.color} 
            />
            {stepInfo.showProgress && (
              <View style={[styles.progressRing, { borderTopColor: stepInfo.color }]} />
            )}
          </View>

          {/* Content */}
          <AppText style={styles.title}>{stepInfo.title}</AppText>
          <AppText style={styles.message}>{stepInfo.message}</AppText>

          {/* Transaction Status and Details */}
          {step === TransactionStep.SUCCESS && signature && (
            <>
              {/* Status Indicator */}
              {txStatus !== TransactionStatus.FAILED && (
                <View style={styles.statusCard}>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: stepInfo.color }]} />
                    <AppText style={styles.statusText}>
                      {txStatus === TransactionStatus.FINALIZED ? 'Completed' : 'In Progress'}
                    </AppText>
                  </View>
                  {confirmations > 0 && (
                    <AppText style={styles.confirmationsText}>
                      {confirmations} confirmation{confirmations !== 1 ? 's' : ''}
                    </AppText>
                  )}
                </View>
              )}

              {/* Transaction Details */}
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Transaction</AppText>
                  <View style={styles.detailValueRow}>
                    <AppText style={styles.detailValue}>
                      {signature.slice(0, 8)}...{signature.slice(-8)}
                    </AppText>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(signature, 'Transaction hash')}
                      activeOpacity={0.8}
                    >
                      <UiIconSymbol name="doc.on.doc" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {mode === 'claim' && rewardAmount && (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>Reward Amount</AppText>
                    <View style={styles.detailValueRow}>
                      <AppText style={styles.detailValue}>
                        {(rewardAmount / Math.pow(10, 6)).toFixed(2)} USDC
                      </AppText>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.explorerButton}
                  onPress={openExplorer}
                  activeOpacity={0.8}
                >
                  <UiIconSymbol name="safari" size={18} color="#ffffff" />
                  <AppText style={styles.explorerButtonText}>View on Explorer</AppText>
                </TouchableOpacity>

                {txStatus === TransactionStatus.FINALIZED && (
                  <TouchableOpacity
                    style={styles.viewChallengeButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[SolanaColors.brand.purple, '#dc1fff']}
                      style={styles.viewChallengeButtonGradient}
                    />
                    <UiIconSymbol name="arrow.right.circle.fill" size={20} color="#ffffff" />
                    <AppText style={styles.viewChallengeButtonText}>Continue</AppText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Next Steps (shown when finalized) */}
              {txStatus === TransactionStatus.FINALIZED && (
                <View style={styles.nextStepsCard}>
                  <UiIconSymbol name="lightbulb.fill" size={20} color="#f59e0b" />
                  <View style={styles.nextStepsContent}>
                    <AppText style={styles.nextStepsTitle}>What's Next?</AppText>
                    <AppText style={styles.nextStepsText}>
                      {mode === 'claim' ? (
                        `• Your reward has been transferred to your wallet{"\n"}• Check your wallet balance for the claimed tokens{"\n"}• Congratulations on completing the challenge!`
                      ) : (
                        `• You're now a participant in this challenge{"\n"}• Wait for the challenge to end for results{"\n"}• Winners can claim rewards after resolution`
                      )}
                    </AppText>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Actions */}
          {step === TransactionStep.ERROR && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <LinearGradient
                colors={[SolanaColors.brand.purple, '#dc1fff']}
                style={styles.buttonGradient}
              />
              <AppText style={styles.retryButtonText}>Try Again</AppText>
            </TouchableOpacity>
          )}

          {/* Only show close button for non-SUCCESS states or when not finalized */}
          {canClose && step !== TransactionStep.SUCCESS && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <AppText style={styles.closeButtonText}>Close</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Toast */}
      <Toast 
        visible={toastVisible} 
        message={toastMessage} 
        onHide={() => setToastVisible(false)}
        duration={2000}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(153, 69, 255, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  signatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  signatureText: {
    fontSize: 12,
    color: SolanaColors.brand.purple,
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  confirmationsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  detailRow: {
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  explorerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden',
  },
  viewChallengeButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  viewChallengeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextStepsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 12,
    width: '100%',
  },
  nextStepsContent: {
    flex: 1,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  nextStepsText: {
    fontSize: 13,
    color: 'rgba(245, 158, 11, 0.9)',
    lineHeight: 20,
  },
})