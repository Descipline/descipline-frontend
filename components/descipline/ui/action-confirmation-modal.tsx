import React from 'react'
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { Challenge, getTokenSymbol, getTokenDecimals } from '@/utils/descipline/types'
import { PublicKey } from '@solana/web3.js'
import { DESCIPLINE_CONFIG } from '@/utils/descipline/constants'
import Clipboard from '@react-native-clipboard/clipboard'
import { useState } from 'react'
import { Toast } from '@/components/ui/toast'

interface ActionConfirmationModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  challenge: Challenge
  creatorAddress: string
  loading: boolean
  realParticipantCount?: number
  mode?: 'stake' | 'claim'
  rewardAmount?: number
  isWinner?: boolean
}

export function ActionConfirmationModal({
  visible,
  onClose,
  onConfirm,
  challenge,
  creatorAddress,
  loading,
  realParticipantCount,
  mode = 'stake',
  rewardAmount,
  isWinner = false
}: ActionConfirmationModalProps) {
  // Toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Debug only when visible
  if (visible && mode === 'stake') {
    console.log('🎯 Stake Modal Data:', {
      challengeName: challenge?.name,
      challengeStakeAmount: challenge?.stakeAmount,
      challengeTokenAllowed: challenge?.tokenAllowed,
      realParticipantCount,
      mode
    })
  }
  
  const tokenSymbol = challenge.tokenAllowed === "USDC" ? "USDC" : "SOL"
  const decimals = challenge.tokenAllowed === "USDC" ? 6 : 9
  const stakeAmount = Number(challenge.stakeAmount) / Math.pow(10, decimals)
  const fee = challenge.fee / 100 // Convert basis points to percentage
  const isSOLChallenge = challenge.tokenAllowed === "WSOL" // Check if this is a SOL challenge
  

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text)
      setToastMessage(`${label} copied`)
      setToastVisible(true)
    } catch (error) {
      console.error('Failed to copy:', error)
      setToastMessage(`Failed to copy ${label}`)
      setToastVisible(true)
    }
  }

  const DetailRow = ({ 
    label, 
    value, 
    fullValue,
    copyable = false, 
    icon 
  }: { 
    label: string
    value: string
    fullValue?: string
    copyable?: boolean
    icon?: string 
  }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        {icon && <UiIconSymbol name={icon} size={16} color="rgba(255, 255, 255, 0.6)" />}
        <AppText style={styles.detailLabel}>{label}</AppText>
      </View>
      <View style={styles.detailRight}>
        <AppText style={styles.detailValue}>{value}</AppText>
        {copyable && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(fullValue || value, label)}
          >
            <UiIconSymbol name="doc.on.doc" size={14} color={SolanaColors.brand.purple} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

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
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <UiIconSymbol 
                name={mode === 'claim' ? "gift.fill" : "checkmark.shield.fill"} 
                size={24} 
                color={mode === 'claim' ? "#fbbf24" : SolanaColors.brand.purple} 
              />
              <AppText style={styles.headerTitle}>
                {mode === 'claim' ? 'Claim Reward' : 'Confirm Participation'}
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <UiIconSymbol name="xmark" size={16} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Debug Info */}
            {visible && mode === 'stake' && (
              <View style={{ backgroundColor: 'red', padding: 10, marginBottom: 10 }}>
                <AppText style={{ color: 'white' }}>DEBUG: Challenge Name: {challenge?.name || 'undefined'}</AppText>
                <AppText style={{ color: 'white' }}>DEBUG: Stake Amount: {challenge?.stakeAmount || 'undefined'}</AppText>
                <AppText style={{ color: 'white' }}>DEBUG: Token: {challenge?.tokenAllowed || 'undefined'}</AppText>
              </View>
            )}
            
            {/* Challenge Info */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Challenge Details</AppText>
              <View style={styles.challengeCard}>
                <AppText style={styles.challengeName}>{challenge.name}</AppText>
                <View style={styles.challengeStats}>
                  <View style={styles.statItem}>
                    <UiIconSymbol name="person.3.fill" size={14} color="rgba(255, 255, 255, 0.6)" />
                    <AppText style={styles.statText}>
                      {realParticipantCount ?? challenge.participantCount ?? 0} participants
                    </AppText>
                  </View>
                  <View style={styles.statItem}>
                    <UiIconSymbol name="clock" size={14} color="rgba(255, 255, 255, 0.6)" />
                    <AppText style={styles.statText}>
                      Ends {new Date(Number(challenge.stakeEndAt) * 1000).toLocaleDateString()}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment/Reward Details */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                {mode === 'claim' ? 'Reward Details' : 'Payment Details'}
              </AppText>
              <View style={styles.paymentCard}>
                {mode === 'claim' ? (
                  <>
                    {/* Claim Mode: Show Winner Status */}
                    <View style={styles.paymentRow}>
                      <AppText style={styles.paymentLabel}>Status</AppText>
                      <View style={styles.winnerBadge}>
                        <UiIconSymbol name="crown.fill" size={14} color="#fbbf24" />
                        <AppText style={styles.winnerText}>🏆 Winner!</AppText>
                      </View>
                    </View>
                    <View style={styles.paymentRow}>
                      <AppText style={styles.paymentLabel}>Reward Amount</AppText>
                      <View style={styles.paymentAmount}>
                        <AppText style={styles.amountValue}>
                          {rewardAmount ? (rewardAmount / Math.pow(10, decimals)).toFixed(2) : '0.00'}
                        </AppText>
                        <AppText style={styles.amountToken}>{tokenSymbol}</AppText>
                      </View>
                    </View>
                    <View style={[styles.paymentRow, styles.totalRow]}>
                      <AppText style={styles.totalLabel}>Total Reward</AppText>
                      <View style={styles.paymentAmount}>
                        <AppText style={styles.totalValue}>
                          {rewardAmount ? (rewardAmount / Math.pow(10, decimals)).toFixed(2) : '0.00'}
                        </AppText>
                        <AppText style={styles.totalToken}>{tokenSymbol}</AppText>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Stake Mode: Original Payment Details */}
                    <View style={styles.paymentRow}>
                      <AppText style={styles.paymentLabel}>Stake Amount</AppText>
                      <View style={styles.paymentAmount}>
                        <AppText style={styles.amountValue}>{stakeAmount}</AppText>
                        <AppText style={styles.amountToken}>{tokenSymbol}</AppText>
                      </View>
                    </View>
                    {fee > 0 && (
                      <View style={styles.paymentRow}>
                        <AppText style={styles.paymentLabel}>Creator Fee</AppText>
                        <AppText style={styles.feeText}>{fee}%</AppText>
                      </View>
                    )}
                    <View style={[styles.paymentRow, styles.totalRow]}>
                      <AppText style={styles.totalLabel}>Total Payment</AppText>
                      <View style={styles.paymentAmount}>
                        <AppText style={styles.totalValue}>{stakeAmount}</AppText>
                        <AppText style={styles.totalToken}>{tokenSymbol}</AppText>
                      </View>
                    </View>
                  </>
                )}
              </View>
              
              {/* SOL Wrapping Notice */}
              {isSOLChallenge && (
                <View style={styles.solWrappingNotice}>
                  <UiIconSymbol name="arrow.triangle.2.circlepath" size={16} color="#f59e0b" />
                  <View style={styles.solWrappingContent}>
                    <AppText style={styles.solWrappingTitle}>SOL Wrapping Required</AppText>
                    <AppText style={styles.solWrappingText}>
                      This transaction will automatically wrap {stakeAmount} SOL to wSOL for the challenge
                    </AppText>
                  </View>
                </View>
              )}
            </View>

            {/* Contract Details */}
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Contract Information</AppText>
              <View style={styles.detailsCard}>
                <DetailRow
                  label="Challenge Contract"
                  value={challenge.publicKey ? `${challenge.publicKey.toString().slice(0, 8)}...${challenge.publicKey.toString().slice(-8)}` : 'Loading...'}
                  fullValue={challenge.publicKey?.toString()}
                  copyable={!!challenge.publicKey}
                  icon="doc.text.fill"
                />
                <DetailRow
                  label="Program ID"
                  value={`${DESCIPLINE_CONFIG.PROGRAM_ID.toString().slice(0, 8)}...${DESCIPLINE_CONFIG.PROGRAM_ID.toString().slice(-8)}`}
                  fullValue={DESCIPLINE_CONFIG.PROGRAM_ID.toString()}
                  copyable
                  icon="cpu"
                />
                <DetailRow
                  label="Creator"
                  value={`${creatorAddress.slice(0, 8)}...${creatorAddress.slice(-8)}`}
                  fullValue={creatorAddress}
                  copyable
                  icon="person.fill"
                />
                <DetailRow
                  label="Credential"
                  value={`${DESCIPLINE_CONFIG.CREDENTIAL_PDA.toString().slice(0, 8)}...${DESCIPLINE_CONFIG.CREDENTIAL_PDA.toString().slice(-8)}`}
                  fullValue={DESCIPLINE_CONFIG.CREDENTIAL_PDA.toString()}
                  copyable
                  icon="checkmark.seal.fill"
                />
                <DetailRow
                  label="Schema"
                  value={`${DESCIPLINE_CONFIG.SCHEMA_PDA.toString().slice(0, 8)}...${DESCIPLINE_CONFIG.SCHEMA_PDA.toString().slice(-8)}`}
                  fullValue={DESCIPLINE_CONFIG.SCHEMA_PDA.toString()}
                  copyable
                  icon="doc.badge.gearshape"
                />
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <UiIconSymbol name="exclamationmark.triangle.fill" size={20} color="#f59e0b" />
              <View style={styles.warningContent}>
                <AppText style={styles.warningTitle}>Important</AppText>
                <AppText style={styles.warningText}>
                  {mode === 'claim' ? (
                    `• Your reward will be transferred to your wallet\n• Make sure you have sufficient SOL for gas fees\n• This will mark your participation as claimed\n• Transaction cannot be reversed once confirmed`
                  ) : (
                    `• Tokens will be locked until the challenge ends\n${isSOLChallenge 
                      ? `• Make sure you have sufficient SOL balance (${stakeAmount} SOL + gas fees)`
                      : `• Make sure you have sufficient ${tokenSymbol} balance`
                    }\n${isSOLChallenge ? '• SOL will be automatically wrapped to wSOL in this transaction\n' : ''}• Transaction cannot be reversed once confirmed`
                  )}
                </AppText>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[SolanaColors.brand.purple, '#dc1fff']}
                style={styles.confirmButtonGradient}
              />
              {loading ? (
                <>
                  <UiIconSymbol name="hourglass" size={20} color="#ffffff" />
                  <AppText style={styles.confirmButtonText}>Processing...</AppText>
                </>
              ) : (
                <>
                  <UiIconSymbol name="checkmark.circle.fill" size={20} color="#ffffff" />
                  <AppText style={styles.confirmButtonText}>
                    {mode === 'claim' ? 'Confirm & Claim' : 'Confirm & Join'}
                  </AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
      
      {/* Toast Notification */}
      <Toast 
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
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
    backgroundColor: SolanaColors.brand.dark,
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
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
    maxHeight: 400,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  paymentCard: {
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  paymentAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  amountToken: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: SolanaColors.brand.purple,
  },
  totalToken: {
    fontSize: 16,
    color: SolanaColors.brand.purple,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: 'rgba(245, 158, 11, 0.9)',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  solWrappingNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 12,
  },
  solWrappingContent: {
    flex: 1,
  },
  solWrappingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  solWrappingText: {
    fontSize: 13,
    color: 'rgba(245, 158, 11, 0.9)',
    lineHeight: 18,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  winnerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
})