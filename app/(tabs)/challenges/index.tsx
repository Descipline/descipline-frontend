import { View, ScrollView } from 'react-native'
import { AppText } from '@/components/app-text'
import { AppPage } from '@/components/app-page'
import { useGetChallenges, useTestConnection } from '@/components/descipline/use-challenge-hooks'
import { ActivityIndicator } from 'react-native'
import { SolanaColors } from '@/constants/colors'

export default function ChallengesScreen() {
  const { data: challenges, isLoading, error } = useGetChallenges()
  const { data: connectionTest } = useTestConnection()

  return (
    <AppPage>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <AppText type="title" style={{ marginBottom: 16, textAlign: 'center' }}>
          Challenges
        </AppText>

        {/* Connection Test Info */}
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <AppText type="defaultSemiBold" style={{ marginBottom: 8 }}>Connection Status:</AppText>
          <AppText>Program: {connectionTest?.hasProgram ? '✅' : '❌'}</AppText>
          <AppText>Wallet: {connectionTest?.hasWallet ? '✅' : '❌'}</AppText>
          <AppText>Connection: {connectionTest?.hasConnection ? '✅' : '❌'}</AppText>
          {connectionTest?.programId && (
            <AppText style={{ fontSize: 12, opacity: 0.7 }}>
              Program ID: {connectionTest.programId.slice(0, 8)}...
            </AppText>
          )}
        </View>

        {/* Challenge List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <ActivityIndicator size="large" color={SolanaColors.brand.purple} />
            <AppText style={{ marginTop: 8 }}>Loading challenges...</AppText>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <AppText type="defaultSemiBold" style={{ color: '#ef4444', marginBottom: 8 }}>
              Error loading challenges
            </AppText>
            <AppText style={{ textAlign: 'center', opacity: 0.7 }}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </AppText>
          </View>
        ) : challenges && challenges.length > 0 ? (
          challenges.map((challenge, index) => (
            <View 
              key={challenge.publicKey?.toString() || index} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: SolanaColors.brand.purple
              }}
            >
              <AppText type="defaultSemiBold" style={{ marginBottom: 4 }}>
                Challenge #{index + 1}
              </AppText>
              <AppText style={{ fontSize: 12, opacity: 0.7 }}>
                {challenge.publicKey?.toString().slice(0, 16)}...
              </AppText>
            </View>
          ))
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <AppText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              No challenges found
            </AppText>
            <AppText style={{ textAlign: 'center', opacity: 0.7 }}>
              There are currently no challenges available on this network.
            </AppText>
          </View>
        )}
      </ScrollView>
    </AppPage>
  )
}