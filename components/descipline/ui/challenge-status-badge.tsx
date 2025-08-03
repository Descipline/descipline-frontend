import React from 'react'
import { View, StyleSheet } from 'react-native'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  RESOLVED = 'RESOLVED',
  CLAIMED = 'CLAIMED'
}

interface ChallengeStatusBadgeProps {
  status: ChallengeStatus
}

export function ChallengeStatusBadge({ status }: ChallengeStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ChallengeStatus.ACTIVE:
        return {
          text: 'Active',
          color: SolanaColors.brand.purple,
          backgroundColor: `${SolanaColors.brand.purple}20`,
          icon: 'play.circle.fill'
        }
      case ChallengeStatus.ENDED:
        return {
          text: 'Ended',
          color: '#f59e0b',
          backgroundColor: '#f59e0b20',
          icon: 'clock.fill'
        }
      case ChallengeStatus.RESOLVED:
        return {
          text: 'Resolved',
          color: '#10b981',
          backgroundColor: '#10b98120',
          icon: 'checkmark.circle.fill'
        }
      case ChallengeStatus.CLAIMED:
        return {
          text: 'Claimed',
          color: '#6b7280',
          backgroundColor: '#6b728020',
          icon: 'trophy.fill'
        }
      default:
        return {
          text: 'Unknown',
          color: '#6b7280',
          backgroundColor: '#6b728020',
          icon: 'questionmark.circle.fill'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <UiIconSymbol name={config.icon} size={12} color={config.color} />
      <AppText style={[styles.badgeText, { color: config.color }]}>
        {config.text}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
})