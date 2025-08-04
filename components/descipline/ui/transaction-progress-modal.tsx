import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Linking, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { useConnection } from '@/components/solana/solana-provider'
import Clipboard from '@react-native-clipboard/clipboard'
import { Toast } from '@/components/ui/toast'
import { getDesciplinePublicKeys } from '@/utils/descipline/constants'

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
  mode?: 'stake' | 'claim' | 'create'
  rewardAmount?: number
  tokenSymbol?: string
  decimals?: number
  showSimpleFlow?: boolean // If true, close after CONFIRMING step
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
  rewardAmount,
  tokenSymbol = 'USDC',
  decimals = 6,
  showSimpleFlow = false
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

  // Auto-close for simple flow (create challenge)
  useEffect(() => {
    if (showSimpleFlow && step === TransactionStep.SUCCESS && signature) {
      // Auto close after 2 seconds for simple flow
      const timeout = setTimeout(() => {
        onClose()
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [showSimpleFlow, step, signature, onClose])

  // Poll transaction status when signature is available and step is SUCCESS (only for full flow)
  useEffect(() => {
    if (!connection || !signature || step !== TransactionStep.SUCCESS || showSimpleFlow) return

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
          
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
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
          {console.log('🔍 Modal render check:', { step, signature: signature ? 'EXISTS' : 'MISSING', showSimpleFlow })}
          {step === TransactionStep.SUCCESS && signature && (
            <>
              {/* Status Indicator - Only for full flow */}
              {!showSimpleFlow && txStatus !== TransactionStatus.FAILED && (
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

              {/* Transaction Information - Spacious Layout */}
              {console.log('🔍 Rendering transaction card with signature:', signature)}
              <View style={[styles.transactionCard, styles.fullWidthCard]}>
                <View style={styles.transactionRow}>
                  <AppText style={styles.transactionLabel}>TEST LABEL</AppText>
                  <View style={styles.transactionValueRow}>
                    <AppText style={styles.transactionValue} numberOfLines={1}>
                      TEST HASH VALUE
                    </AppText>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => console.log('Copy clicked')}
                      activeOpacity={0.8}
                    >
                      <AppText style={{color: 'red', fontSize: 20}}>COPY</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Program Address Row */}
                <View style={styles.transactionRow}>
                  <AppText style={styles.transactionLabel}>TEST PROGRAM</AppText>
                  <View style={styles.transactionValueRow}>
                    <AppText style={styles.transactionValue} numberOfLines={1}>
                      TEST PROGRAM VALUE
                    </AppText>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => console.log('Program copy clicked')}
                      activeOpacity={0.8}
                    >
                      <AppText style={{color: 'blue', fontSize: 20}}>PROG</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {mode === 'claim' && rewardAmount && (
                  <View style={styles.transactionRow}>
                    <AppText style={styles.transactionLabel}>Reward Amount</AppText>
                    <View style={styles.transactionValueRow}>
                      <AppText style={styles.transactionValue}>
                        {(rewardAmount / Math.pow(10, decimals)).toFixed(decimals === 9 ? 4 : 2)} {tokenSymbol}
                      </AppText>
                    </View>
                  </View>
                )}
              </View>
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

          {/* Success Actions - Unified Style for All SUCCESS States */}
          {step === TransactionStep.SUCCESS && signature && (
            <View style={styles.actionButtons}>
              {/* View on Explorer - Show when finalized OR in simple flow */}
              {(txStatus === TransactionStatus.FINALIZED || showSimpleFlow) && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={openExplorer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[SolanaColors.brand.purple, '#dc1fff']}
                    style={styles.primaryButtonGradient}
                  />
                  <UiIconSymbol name="arrow.up.right.square" size={20} color="#ffffff" />
                  <AppText style={styles.primaryButtonText}>View on Explorer</AppText>
                </TouchableOpacity>
              )}

              {/* Close Button - Full width style */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  txStatus !== TransactionStatus.FINALIZED && styles.fullWidthButton
                ]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <UiIconSymbol name="xmark" size={16} color={SolanaColors.brand.purple} />
                <AppText style={styles.secondaryButtonText}>
                  {txStatus === TransactionStatus.FINALIZED ? 'Close' : 'Close'}
                </AppText>
              </TouchableOpacity>
            </View>
          )}

            {/* Simple Close for non-SUCCESS states */}
            {canClose && step !== TransactionStep.SUCCESS && (
              <TouchableOpacity style={styles.simpleCloseButton} onPress={onClose}>
                <AppText style={styles.simpleCloseButtonText}>Close</AppText>
              </TouchableOpacity>
            )}
          </ScrollView>
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
    alignItems: 'center',
    minWidth: 300,
    maxHeight: '80%', // Limit modal height
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalScrollContent: {
    padding: 32,
    alignItems: 'center',
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
  // Success Action Buttons - Full Width Layout
  actionButtons: {
    marginTop: 12,
    marginHorizontal: -8, // Extend closer to modal edges
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SolanaColors.brand.purple,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SolanaColors.brand.purple,
  },
  fullWidthButton: {
    alignSelf: 'stretch', // Make button full width of container
    marginHorizontal: 0,
  },
  fullWidthCard: {
    alignSelf: 'stretch', // Make card full width
    marginHorizontal: -8, // Extend to edges like actionButtons
  },
  // Simple close for non-success states
  simpleCloseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  simpleCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCard: {
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  confirmationsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  // Transaction Card - Spacious Layout
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    flex: 1,
  },
  transactionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 2,
    justifyContent: 'flex-end',
  },
  transactionValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 6,
    backgroundColor: 'rgba(153, 69, 255, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.4)',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  explorerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
})