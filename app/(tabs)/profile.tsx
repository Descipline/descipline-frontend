import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { useAuth } from '@/components/auth/auth-provider'
import { useWalletGuard } from '@/hooks/use-wallet-guard'
import { SolanaColors } from '@/constants/colors'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { useUserCreatedChallenges, useUserParticipatedChallenges, useUserStats } from '@/components/descipline/profile/use-profile-hooks'
import { UserStatsCard } from '@/components/descipline/profile/user-stats-card'
import { UserChallengeCard } from '@/components/descipline/profile/user-challenge-card'

type TabType = 'stats' | 'created' | 'participated' | 'rewards'

export default function Profile() {
  useWalletGuard()
  const { account, disconnect } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  
  const createdQuery = useUserCreatedChallenges()
  const participatedQuery = useUserParticipatedChallenges()
  const statsQuery = useUserStats()
  
  // Debug profile state
  console.log('🏠 Profile: Component render state:')
  console.log('👤 Profile: Account:', account?.publicKey?.toString())
  console.log('📈 Profile: Stats query:', { 
    data: statsQuery.data, 
    isLoading: statsQuery.isLoading, 
    error: statsQuery.error 
  })
  console.log('📝 Profile: Created query:', { 
    data: createdQuery.data?.length, 
    isLoading: createdQuery.isLoading, 
    error: createdQuery.error 
  })
  console.log('🎯 Profile: Participated query:', { 
    data: participatedQuery.data?.length, 
    isLoading: participatedQuery.isLoading, 
    error: participatedQuery.error 
  })
  
  // Prevent rendering if account is null (will be redirected by guard)
  if (!account) {
    console.log('❌ Profile: No account, returning null')
    return null
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const tabs = [
    { id: 'stats', label: 'Overview', icon: 'chart.bar.fill' },
    { id: 'created', label: 'Created', icon: 'plus.app', count: createdQuery.data?.length },
    { id: 'participated', label: 'Joined', icon: 'person.2', count: participatedQuery.data?.length },
    { id: 'rewards', label: 'Rewards', icon: 'trophy.fill' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <View>
            <UserStatsCard stats={statsQuery.data} isLoading={statsQuery.isLoading} />
            
            {/* Recent Activity Preview */}
            {createdQuery.data && createdQuery.data.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText style={styles.sectionTitle}>Recent Created</AppText>
                  <TouchableOpacity onPress={() => setActiveTab('created')}>
                    <AppText style={styles.seeAllText}>See All</AppText>
                  </TouchableOpacity>
                </View>
                {createdQuery.data.slice(0, 2).map((challenge) => (
                  <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
                ))}
              </View>
            )}
            
            {participatedQuery.data && participatedQuery.data.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AppText style={styles.sectionTitle}>Recent Participated</AppText>
                  <TouchableOpacity onPress={() => setActiveTab('participated')}>
                    <AppText style={styles.seeAllText}>See All</AppText>
                  </TouchableOpacity>
                </View>
                {participatedQuery.data.slice(0, 2).map((challenge) => (
                  <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
                ))}
              </View>
            )}
          </View>
        )
      
      case 'created':
        return (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>My Created Challenges</AppText>
            {createdQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <UiIconSymbol name="hourglass" size={32} color={SolanaColors.brand.purple} />
                <AppText style={styles.loadingText}>Loading created challenges...</AppText>
              </View>
            ) : createdQuery.data && createdQuery.data.length > 0 ? (
              createdQuery.data.map((challenge) => (
                <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <UiIconSymbol name="plus.app" size={48} color="rgba(255, 255, 255, 0.3)" />
                <AppText style={styles.emptyTitle}>No Challenges Created</AppText>
                <AppText style={styles.emptySubtitle}>
                  Create your first challenge to get started!
                </AppText>
              </View>
            )}
          </View>
        )
      
      case 'participated':
        return (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>My Participated Challenges</AppText>
            {participatedQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <UiIconSymbol name="hourglass" size={32} color={SolanaColors.brand.purple} />
                <AppText style={styles.loadingText}>Loading participated challenges...</AppText>
              </View>
            ) : participatedQuery.data && participatedQuery.data.length > 0 ? (
              participatedQuery.data.map((challenge) => (
                <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <UiIconSymbol name="person.2" size={48} color="rgba(255, 255, 255, 0.3)" />
                <AppText style={styles.emptyTitle}>No Challenges Joined</AppText>
                <AppText style={styles.emptySubtitle}>
                  Join a challenge to see your participation history!
                </AppText>
              </View>
            )}
          </View>
        )
      
      case 'rewards':
        const wonChallenges = participatedQuery.data?.filter(c => (c as any).userStatus === 'winner') || []
        const claimableChallenges = participatedQuery.data?.filter(c => (c as any).userCanClaim) || []
        
        return (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>My Rewards</AppText>
            
            {claimableChallenges.length > 0 && (
              <View style={styles.subsection}>
                <AppText style={styles.subsectionTitle}>🎁 Ready to Claim</AppText>
                {claimableChallenges.map((challenge) => (
                  <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
                ))}
              </View>
            )}
            
            {wonChallenges.length > 0 && (
              <View style={styles.subsection}>
                <AppText style={styles.subsectionTitle}>🏆 Won Challenges</AppText>
                {wonChallenges.map((challenge) => (
                  <UserChallengeCard key={challenge.publicKey.toString()} challenge={challenge} />
                ))}
              </View>
            )}
            
            {wonChallenges.length === 0 && claimableChallenges.length === 0 && (
              <View style={styles.emptyState}>
                <UiIconSymbol name="trophy" size={48} color="rgba(255, 255, 255, 0.3)" />
                <AppText style={styles.emptyTitle}>No Rewards Yet</AppText>
                <AppText style={styles.emptySubtitle}>
                  Win challenges to earn rewards!
                </AppText>
              </View>
            )}
          </View>
        )
      
      default:
        return null
    }
  }


  return (
    <AppView style={styles.container}>
      <LinearGradient
        colors={[SolanaColors.brand.dark, '#2a1a3a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={['rgba(153, 69, 255, 0.2)', 'rgba(220, 31, 255, 0.1)']}
          style={styles.profileGradient}
        />
        <View style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[SolanaColors.brand.purple, '#dc1fff']}
              style={styles.avatar}
            >
              <AppText style={styles.avatarText}>
                {account.publicKey.toString().slice(0, 2).toUpperCase()}
              </AppText>
            </LinearGradient>
          </View>
          
          <View style={styles.profileInfo}>
            <AppText style={styles.walletAddress}>
              {`${account.publicKey.toString().slice(0, 8)}...${account.publicKey.toString().slice(-8)}`}
            </AppText>
            <AppText style={styles.profileLabel}>Connected Wallet</AppText>
          </View>
          
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <UiIconSymbol name="power" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id as TabType)}
            >
              <UiIconSymbol 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <AppText 
                style={[
                  styles.tabText, 
                  activeTab === tab.id && styles.activeTabText
                ]}
              >
                {tab.label}
              </AppText>
              {tab.count !== undefined && tab.count > 0 && (
                <View style={styles.tabBadge}>
                  <AppText style={styles.tabBadgeText}>{tab.count}</AppText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Profile Header
  profileHeader: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  profileGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  profileLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  disconnectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },

  // Tab Navigation
  tabContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabScrollContent: {
    paddingRight: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  activeTab: {
    backgroundColor: SolanaColors.brand.purple,
    borderColor: SolanaColors.brand.purple,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: SolanaColors.brand.purple,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },

  // Loading States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
})