import React from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View, StyleSheet } from 'react-native'
import { AppText } from '@/components/app-text'
import { SolanaColors } from '@/constants/colors'
import { useGetChallengesWithGill } from '@/components/descipline/use-gill-challenge-hooks'
import { ChallengeCard } from '@/components/descipline/challenge-card'
import { useRouter } from 'expo-router'

export function ChallengeList() {
  const router = useRouter()
  const { data: challenges, isLoading, refetch, error } = useGetChallengesWithGill()

  const handleChallengePress = (challengeId: string) => {
    router.push(`/challenges/detail?id=${challengeId}`)
  }

  const renderChallenge = ({ item }: { item: any }) => {
    try {
      if (!item || !item.publicKey) {
        console.warn('Invalid challenge item:', item)
        return null
      }

      return (
        <ChallengeCard
          challenge={item}
          onPress={() => handleChallengePress(item.publicKey)}
        />
      )
    } catch (error) {
      console.error('Error rendering challenge item:', error, item)
      return (
        <View style={styles.errorCard}>
          <AppText style={styles.errorText}>Error loading challenge</AppText>
        </View>
      )
    }
  }

  // Handle error state
  if (error) {
    return (
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
    )
  }

  if (!challenges && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText style={styles.loadingIcon}>⏳</AppText>
        <AppText style={styles.loadingText}>Loading challenges...</AppText>
        <AppText style={styles.loadingSubtext}>Fetching the latest challenges from the blockchain</AppText>
      </View>
    )
  }

  return (
    <FlatList
      data={challenges || []}
      renderItem={renderChallenge}
      keyExtractor={(item, index) => {
        // Fallback to index if publicKey is unavailable
        return item?.publicKey?.toString() || `challenge-${index}`
      }}
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
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
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
  errorCard: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  errorText: {
    color: 'rgba(255, 69, 58, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
})