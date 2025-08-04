import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, Linking, Platform, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { useConnection } from '@/components/solana/solana-provider'
import Clipboard from '@react-native-clipboard/clipboard'

export enum TransactionStep {
  PREPARING = 'preparing',
  SIGNING = 'signing',
  SENDING = 'sending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error'
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
  console.log('🎯 TransactionProgressModal render:', { visible, step, error, signature, mode })
  
  if (!visible) {
    console.log('🎯 TransactionProgressModal: Not rendering because visible=false')
    return null
  }

  // Helper functions
  const getStepIcon = (step: TransactionStep) => {
    switch (step) {
      case TransactionStep.PREPARING: return 'gear'
      case TransactionStep.SIGNING: return 'hand.raised.fill'
      case TransactionStep.SENDING: return 'paperplane.fill'
      case TransactionStep.CONFIRMING: return 'clock.fill'
      case TransactionStep.SUCCESS: return 'checkmark.circle.fill'
      case TransactionStep.ERROR: return 'xmark.circle.fill'
      default: return 'hourglass'
    }
  }

  const getStepColor = (step: TransactionStep) => {
    switch (step) {
      case TransactionStep.SUCCESS: return SolanaColors.brand.green
      case TransactionStep.ERROR: return '#ef4444'
      case TransactionStep.SIGNING: return '#f59e0b'
      default: return SolanaColors.brand.purple
    }
  }

  const getStepTitle = (step: TransactionStep) => {
    switch (step) {
      case TransactionStep.PREPARING: return 'Preparing Transaction'
      case TransactionStep.SIGNING: return 'Wallet Signature Required'
      case TransactionStep.SENDING: return 'Sending Transaction'
      case TransactionStep.CONFIRMING: return 'Confirming Transaction'
      case TransactionStep.SUCCESS: return mode === 'claim' ? 'Reward Claimed!' : 'Welcome to the Challenge!'
      case TransactionStep.ERROR: return 'Transaction Failed'
      default: return 'Processing Transaction'
    }
  }

  const getStepMessage = (step: TransactionStep) => {
    switch (step) {
      case TransactionStep.PREPARING: return 'Building transaction instructions...'
      case TransactionStep.SIGNING: return 'Please approve the transaction in your wallet'
      case TransactionStep.SENDING: return 'Broadcasting to Solana network...'
      case TransactionStep.CONFIRMING: return 'Waiting for network confirmation...'
      case TransactionStep.SUCCESS: return mode === 'claim' ? '🎉 Successfully claimed your reward!' : '🎉 Successfully joined the challenge!'
      case TransactionStep.ERROR: return error || 'An unexpected error occurred'
      default: return 'Processing...'
    }
  }

  const shouldShowProgress = (step: TransactionStep) => {
    return step !== TransactionStep.SUCCESS && step !== TransactionStep.ERROR
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            <LinearGradient
              colors={[SolanaColors.brand.dark, '#1a0b2e']}
              style={StyleSheet.absoluteFillObject}
            />
            
            {/* Progress Circle */}
            <View style={styles.iconContainer}>
              <UiIconSymbol 
                name={getStepIcon(step)} 
                size={48} 
                color={getStepColor(step)} 
              />
              {shouldShowProgress(step) && (
                <View style={[styles.progressRing, { borderTopColor: getStepColor(step) }]} />
              )}
            </View>

            {/* Content */}
            <AppText style={styles.title}>{getStepTitle(step)}</AppText>
            <AppText style={styles.message}>{getStepMessage(step)}</AppText>

            {/* Transaction Details */}
            {signature && (
              <View style={styles.detailsCard}>
                <AppText style={styles.detailsTitle}>Transaction Details</AppText>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Signature</AppText>
                  <AppText style={styles.detailText}>
                    {`${signature.slice(0, 8)}...${signature.slice(-8)}`}
                  </AppText>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {step === TransactionStep.ERROR ? (
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={onClose}
                >
                  <AppText style={styles.closeButtonText}>Close</AppText>
                </TouchableOpacity>
              ) : (step === TransactionStep.SUCCESS || step === TransactionStep.ERROR) ? (
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={onClose}
                >
                  <UiIconSymbol name="checkmark.circle.fill" size={16} color="#ffffff" />
                  <AppText style={styles.closeButtonText}>Continue</AppText>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
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
  modalContainer: {
    backgroundColor: SolanaColors.brand.dark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    alignItems: 'center',
    minHeight: 300,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
  },
  progressRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    borderTopColor: SolanaColors.brand.purple,
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
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  detailText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  closeButton: {
    backgroundColor: SolanaColors.brand.purple,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})