import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/app-text'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { UserStats } from './use-profile-hooks'

interface UserStatsCardProps {
  stats?: UserStats
  isLoading?: boolean
}

export function UserStatsCard({ stats, isLoading }: UserStatsCardProps) {
  console.log('📊 UserStatsCard: Render with props:', { stats, isLoading })
  
  if (isLoading) {
    console.log('⏳ UserStatsCard: Showing loading state')
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)']}
          style={styles.gradient}
        />
        <View style={styles.loadingContainer}>
          <UiIconSymbol name="hourglass" size={32} color={SolanaColors.brand.purple} />
          <AppText style={styles.loadingText}>Loading stats...</AppText>
        </View>
      </View>
    )
  }

  if (!stats) {
    console.log('❌ UserStatsCard: No stats data, returning null')
    return null
  }
  
  console.log('✅ UserStatsCard: Rendering stats:', stats)

  const statItems = [
    {
      icon: 'plus.app',
      label: 'Created',
      value: stats.totalCreated.toString(),
    },
    {
      icon: 'person.2',
      label: 'Joined',
      value: stats.totalParticipated.toString(),
    },
    {
      icon: 'trophy.fill',
      label: 'Won',
      value: stats.totalWon.toString(),
    },
    {
      icon: 'dollarsign.circle.fill',
      label: 'Earned',
      value: `$${stats.totalEarned}`,
    },
  ]

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <AppText style={styles.title}>Your Statistics</AppText>
        <View style={styles.statsGrid}>
          {statItems.map((item, index) => (
            <View key={index} style={styles.statItem}>
              <UiIconSymbol 
                name={item.icon} 
                size={24} 
                color={SolanaColors.brand.purple} 
              />
              <AppText style={styles.statValue}>{item.value}</AppText>
              <AppText style={styles.statLabel}>{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: 120,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})