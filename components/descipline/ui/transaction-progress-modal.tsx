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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(255, 0, 0, 0.9)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: 'white', borderWidth: 3, borderColor: 'blue' }]}>
          <AppText style={{ color: 'black', fontSize: 24, textAlign: 'center', padding: 20 }}>
            TEST MODAL CONTENT - Step: {step}
          </AppText>
          {signature && (
            <AppText style={{ color: 'black', fontSize: 16, textAlign: 'center', padding: 10 }}>
              Signature: {signature.slice(0, 8)}...{signature.slice(-8)}
            </AppText>
          )}
          {error && (
            <AppText style={{ color: 'red', fontSize: 16, textAlign: 'center', padding: 10 }}>
              Error: {error}
            </AppText>
          )}
          <TouchableOpacity 
            style={{ backgroundColor: 'blue', padding: 20, margin: 20, borderRadius: 10 }}
            onPress={onClose}
          >
            <AppText style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
              Close
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: SolanaColors.brand.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '85%',
    overflow: 'hidden',
  },
})