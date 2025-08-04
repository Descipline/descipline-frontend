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
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <LinearGradient
            colors={[SolanaColors.brand.dark, '#1a0b2e']}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <UiIconSymbol 
                name="clock.fill" 
                size={24} 
                color={SolanaColors.brand.purple} 
              />
              <AppText style={styles.headerTitle}>Transaction Progress</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <UiIconSymbol name="xmark" size={16} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Progress Icon */}
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

            {/* Status Text */}
            <AppText style={styles.statusTitle}>{getStepTitle(step)}</AppText>
            <AppText style={styles.statusMessage}>{getStepMessage(step)}</AppText>
            
            {/* Debug Info */}
            <AppText style={styles.debugText}>
              调试信息: 当前步骤 = {step}
            </AppText>
            {signature && (
              <AppText style={styles.debugText}>
                签名: {signature.slice(0, 8)}...{signature.slice(-8)}
              </AppText>
            )}
            {error && (
              <AppText style={styles.testError}>
                错误: {error}
              </AppText>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
            >
              <AppText style={styles.actionButtonText}>关闭</AppText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    minHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
  },
  progressRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    borderTopColor: SolanaColors.brand.purple,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  debugText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  testError: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: SolanaColors.brand.purple,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})