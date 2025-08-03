import React from 'react'
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { AppText } from '@/components/app-text'
import { AppPage } from '@/components/app-page'
import { ActivityIndicator } from 'react-native'
import { SolanaColors } from '@/constants/colors'
import { useGetChallengeWithGill } from '@/components/descipline/use-gill-challenge-hooks'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useWalletGuard } from '@/hooks/use-wallet-guard'

export default function ChallengeDetailScreen() {
  useWalletGuard()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  
  const { 
    data: challenge, 
    isLoading, 
    error 
  } = useGetChallengeWithGill(id)

  const formatAmount = (amount: string) => {
    const num = parseInt(amount)
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString()
  }

  const getTimeRemaining = (endTimestamp: string) => {
    const now = Date.now() / 1000
    const end = parseInt(endTimestamp)
    const diff = end - now
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const isExpired = () => {
    if (!challenge) return false
    const now = Date.now() / 1000
    return now > parseInt(challenge.stakeEndAt)
  }

  const isClaimable = () => {
    if (!challenge) return false
    const now = Date.now() / 1000
    return now >= parseInt(challenge.claimStartFrom) && now <= parseInt(challenge.stakeEndAt)
  }

  const getStatusInfo = () => {
    if (!challenge) return { text: 'Unknown', color: '#6b7280' }
    
    if (isExpired()) return { text: 'Expired', color: '#ef4444' }
    if (isClaimable()) return { text: 'Claimable', color: '#10b981' }
    if (challenge.isActive) return { text: 'Active', color: SolanaColors.brand.purple }
    return { text: 'Inactive', color: '#6b7280' }
  }

  const handleStake = () => {
    Alert.alert(
      'Stake in Challenge',
      'Staking functionality will be implemented in the next update.',
      [{ text: 'OK' }]
    )
  }

  const handleClaim = () => {
    Alert.alert(
      'Claim Rewards',
      'Claiming functionality will be implemented in the next update.',
      [{ text: 'OK' }]
    )
  }

  if (isLoading) {
    return (
      <AppPage>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={SolanaColors.brand.purple} />
          <AppText style={{ marginTop: 8 }}>Loading challenge details...</AppText>
        </View>
      </AppPage>
    )
  }

  if (error || !challenge) {
    return (
      <AppPage>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <AppText type="defaultSemiBold" style={{ color: '#ef4444', marginBottom: 8 }}>
            Error loading challenge
          </AppText>
          <AppText style={{ textAlign: 'center', opacity: 0.7, marginBottom: 16 }}>
            {error instanceof Error ? error.message : 'Challenge not found'}
          </AppText>
          <TouchableOpacity
            style={{
              backgroundColor: SolanaColors.brand.purple,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <AppText style={{ color: '#ffffff', fontWeight: '600' }}>
              Go Back
            </AppText>
          </TouchableOpacity>
        </View>
      </AppPage>
    )
  }

  const statusInfo = getStatusInfo()

  return (
    <AppPage>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            style={{ alignSelf: 'flex-start', marginBottom: 16 }}
            onPress={() => router.back()}
          >
            <AppText style={{ color: SolanaColors.brand.purple }}>← Back to Challenges</AppText>
          </TouchableOpacity>
          
          <AppText type="title" style={{ marginBottom: 8 }}>
            {challenge.name}
          </AppText>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={[
              { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginRight: 12 },
              { backgroundColor: statusInfo.color }
            ]}>
              <AppText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                {statusInfo.text}
              </AppText>
            </View>
            <AppText style={{ fontSize: 14, opacity: 0.7 }}>
              {getTimeRemaining(challenge.stakeEndAt)}
            </AppText>
          </View>
          
          <AppText style={{ fontSize: 12, opacity: 0.5, fontFamily: 'monospace' }}>
            {challenge.publicKey}
          </AppText>
        </View>

        {/* Challenge Info */}
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <AppText type="defaultSemiBold" style={{ marginBottom: 16 }}>Challenge Details</AppText>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ opacity: 0.7 }}>Stake Amount</AppText>
              <AppText type="defaultSemiBold">
                {formatAmount(challenge.stakeAmount)} {challenge.tokenAllowed}
              </AppText>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ opacity: 0.7 }}>Fee</AppText>
              <AppText type="defaultSemiBold">{challenge.fee / 100}%</AppText>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ opacity: 0.7 }}>Token Type</AppText>
              <View style={[
                { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
                { backgroundColor: challenge.tokenAllowed === 'USDC' ? '#2563eb' : '#9945ff' }
              ]}>
                <AppText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                  {challenge.tokenAllowed}
                </AppText>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ opacity: 0.7 }}>Participants</AppText>
              <AppText type="defaultSemiBold">{challenge.participantCount}</AppText>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <AppText type="defaultSemiBold" style={{ marginBottom: 16 }}>Timeline</AppText>
          
          <View style={{ gap: 12 }}>
            <View>
              <AppText style={{ opacity: 0.7, marginBottom: 4 }}>Stake Period Ends</AppText>
              <AppText type="defaultSemiBold">{formatDate(challenge.stakeEndAt)}</AppText>
            </View>
            
            <View>
              <AppText style={{ opacity: 0.7, marginBottom: 4 }}>Claim Period Starts</AppText>
              <AppText type="defaultSemiBold">{formatDate(challenge.claimStartFrom)}</AppText>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <AppText type="defaultSemiBold" style={{ marginBottom: 16 }}>Participants</AppText>
          
          <View style={{ gap: 12 }}>
            <View>
              <AppText style={{ opacity: 0.7, marginBottom: 4 }}>Initiator</AppText>
              <AppText style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {challenge.initiator}
              </AppText>
            </View>
            
            <View>
              <AppText style={{ opacity: 0.7, marginBottom: 4 }}>Schema</AppText>
              <AppText style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {challenge.schemaPda}
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {!isExpired() && (
            <TouchableOpacity
              style={{
                backgroundColor: SolanaColors.brand.purple,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={handleStake}
            >
              <AppText type="defaultSemiBold" style={{ color: '#ffffff' }}>
                Stake in Challenge
              </AppText>
            </TouchableOpacity>
          )}
          
          {isClaimable() && (
            <TouchableOpacity
              style={{
                backgroundColor: '#10b981',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={handleClaim}
            >
              <AppText type="defaultSemiBold" style={{ color: '#ffffff' }}>
                Claim Rewards
              </AppText>
            </TouchableOpacity>
          )}
          
          {isExpired() && (
            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ef4444',
            }}>
              <AppText style={{ color: '#ef4444' }}>
                This challenge has expired
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </AppPage>
  )
}