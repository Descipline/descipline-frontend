import React from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View, StyleSheet } from 'react-native'
import { AppText } from '@/components/app-text'
import { AppPage } from '@/components/app-page'
import { SolanaColors } from '@/constants/colors'
import { 
  useGetChallengesWithGill,
  useGetProgramStatsWithGill,
  useTestGillConnection 
} from '@/components/descipline/use-gill-challenge-hooks'
import { ChallengeCard } from '@/components/descipline/challenge-card'
import { useRouter } from 'expo-router'

export default function ChallengesScreen() {
  const router = useRouter()
  
  const { 
    data: challenges, 
    isLoading, 
    error,
    refetch 
  } = useGetChallengesWithGill()
  
  const { 
    data: stats 
  } = useGetProgramStatsWithGill()
  
  const { 
    data: connectionTest 
  } = useTestGillConnection()

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenges/detail?id=${challengeId}`)
  }

  const renderChallenge = ({ item }) => {
    return (
      <ChallengeCard
        challenge={item}
        onPress={() => handleChallengePress(item.publicKey)}
      />
    )
  }

  // Handle error state
  if (error) {
    return (
      <AppPage>
        <View style={styles.errorContainer}>
          <AppText style={styles.errorIcon}>⚠️</AppText>
          <AppText style={styles.errorTitle}>Failed to Load Challenges</AppText>
          <AppText style={styles.errorSubtext}>
            {error instanceof Error ? error.message : 'Something went wrong'}
          </AppText>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <AppText style={styles.retryButtonText}>Try Again</AppText>
          </TouchableOpacity>
        </View>
      </AppPage>
    )
  }

  if (!challenges && isLoading) {
    return (
      <AppPage>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingIcon}>⏳</AppText>
          <AppText style={styles.loadingText}>Loading challenges...</AppText>
          <AppText style={styles.loadingSubtext}>Fetching the latest challenges from the blockchain</AppText>
        </View>
      </AppPage>
    )
  }

  const HeaderComponent = () => (
    <View style={styles.header}>
      <AppText style={styles.title}>Challenges</AppText>
      
      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <AppText style={styles.statsTitle}>Program Statistics</AppText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <AppText style={styles.statValue}>{stats.totalChallenges}</AppText>
              <AppText style={styles.statLabel}>Total</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={[styles.statValue, { color: '#10b981' }]}>{stats.activeChallenges}</AppText>
              <AppText style={styles.statLabel}>Active</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText style={[styles.statValue, { color: '#f59e0b' }]}>{stats.totalReceipts}</AppText>
              <AppText style={styles.statLabel}>Receipts</AppText>
            </View>
          </View>
        </View>
      )}

      {/* Connection Status */}
      {connectionTest && (
        <View style={styles.connectionContainer}>
          <AppText style={styles.connectionText}>
            Connection: {connectionTest.success ? '🟢 Online' : '🔴 Offline'}
          </AppText>
          {connectionTest.error && (
            <AppText style={styles.connectionError}>
              {connectionTest.error}
            </AppText>
          )}
        </View>
      )}

      {challenges && challenges.length > 0 && (
        <AppText style={styles.challengeCount}>
          Found {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
        </AppText>
      )}
    </View>
  )

  return (
    <AppPage>
      <FlatList
        data={challenges || []}
        renderItem={renderChallenge}
        keyExtractor={(item, index) => item?.publicKey || `challenge-${index}`}
        ListHeaderComponent={HeaderComponent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refetch}
            tintColor={SolanaColors.brand.purple}
            colors={[SolanaColors.brand.purple]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={5}
        getItemLayout={(data, index) => ({
          length: 150, // Approximate height of each challenge card
          offset: 150 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyIcon}>🏆</AppText>
            <AppText style={styles.emptyTitle}>No Challenges Yet</AppText>
            <AppText style={styles.emptySubtitle}>
              Be the first to create a challenge and start competing!
            </AppText>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refetch}
            >
              <AppText style={styles.refreshButtonText}>Refresh</AppText>
            </TouchableOpacity>
          </View>
        }
      />
    </AppPage>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: SolanaColors.brand.purple,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  connectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectionError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  challengeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  loadingIcon: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: SolanaColors.brand.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: SolanaColors.brand.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})