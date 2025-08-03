/**
 * Gill Library Test Page
 * Test if gill can read contract data without BN errors
 */

import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { AppText } from '@/components/app-text'
import { AppButton } from '@/components/app-button'
import { AppCard } from '@/components/app-card'
import { useConnection } from '@/components/solana/solana-provider'
import { useCluster } from '@/components/cluster/cluster-provider'
import { 
  testGillConnection, 
  fetchChallengesWithGill, 
  getChallengeStatsWithGill,
  type GillChallengeData 
} from '@/utils/descipline/gill-reader'

export default function GillTestScreen() {
  const connection = useConnection()
  const { selectedCluster } = useCluster()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    connection: boolean | null
    challenges: GillChallengeData[]
    stats: any
    error: string | null
  }>({
    connection: null,
    challenges: [],
    stats: null,
    error: null
  })

  const runGillTest = async () => {
    if (!connection || !selectedCluster) {
      Alert.alert('Error', 'No Solana connection or cluster available')
      return
    }

    setLoading(true)
    setTestResults({
      connection: null,
      challenges: [],
      stats: null,
      error: null
    })

    try {
      console.log('🧪 Starting gill library test...')
      console.log('🧪 Using RPC:', selectedCluster.endpoint)

      // Test 1: Basic connection
      console.log('🧪 Test 1: Gill connection test')
      const connectionTest = await testGillConnection(selectedCluster.endpoint)
      
      setTestResults(prev => ({
        ...prev,
        connection: connectionTest
      }))

      if (!connectionTest) {
        throw new Error('Gill connection test failed')
      }

      // Test 2: Fetch challenges
      console.log('🧪 Test 2: Fetch challenges with gill')
      const challenges = await fetchChallengesWithGill(selectedCluster.endpoint)
      
      setTestResults(prev => ({
        ...prev,
        challenges
      }))

      // Test 3: Get statistics
      console.log('🧪 Test 3: Get statistics with gill')
      const stats = await getChallengeStatsWithGill(selectedCluster.endpoint)
      
      setTestResults(prev => ({
        ...prev,
        stats
      }))

      console.log('✅ All gill tests completed successfully!')
      Alert.alert('Success', 'Gill library tests completed successfully!')

    } catch (error: any) {
      console.error('❌ Gill test error:', error)
      setTestResults(prev => ({
        ...prev,
        error: error.message || 'Unknown error'
      }))
      Alert.alert('Error', `Gill test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run test when component mounts
    if (connection && selectedCluster) {
      runGillTest()
    }
  }, [connection, selectedCluster])

  return (
    <ScrollView style={styles.container}>
      <AppCard style={styles.header}>
        <AppText style={styles.title}>Gill Library Test</AppText>
        <AppText style={styles.subtitle}>
          Testing gill library as Anchor alternative for React Native
        </AppText>
      </AppCard>

      <AppCard style={styles.section}>
        <AppText style={styles.sectionTitle}>Test Controls</AppText>
        <AppButton
          title={loading ? "Running Tests..." : "Run Gill Tests"}
          onPress={runGillTest}
          disabled={loading || !connection}
        />
      </AppCard>

      {/* Connection Test Results */}
      <AppCard style={styles.section}>
        <AppText style={styles.sectionTitle}>Connection Test</AppText>
        <View style={styles.resultRow}>
          <AppText>Status: </AppText>
          <AppText style={[
            styles.status,
            { color: testResults.connection === true ? '#4ade80' : 
                     testResults.connection === false ? '#ef4444' : '#6b7280' }
          ]}>
            {testResults.connection === true ? 'SUCCESS' : 
             testResults.connection === false ? 'FAILED' : 'PENDING'}
          </AppText>
        </View>
      </AppCard>

      {/* Challenges Results */}
      <AppCard style={styles.section}>
        <AppText style={styles.sectionTitle}>Challenges Data</AppText>
        <View style={styles.resultRow}>
          <AppText>Count: </AppText>
          <AppText style={styles.value}>{testResults.challenges.length}</AppText>
        </View>
        {testResults.challenges.map((challenge, index) => (
          <View key={index} style={styles.challengeItem}>
            <AppText style={styles.challengeKey}>Challenge {index + 1}:</AppText>
            <AppText style={styles.challengeValue}>{challenge.publicKey.slice(0, 20)}...</AppText>
          </View>
        ))}
      </AppCard>

      {/* Statistics Results */}
      {testResults.stats && (
        <AppCard style={styles.section}>
          <AppText style={styles.sectionTitle}>Statistics</AppText>
          <View style={styles.resultRow}>
            <AppText>Total Challenges: </AppText>
            <AppText style={styles.value}>{testResults.stats.totalChallenges}</AppText>
          </View>
          <View style={styles.resultRow}>
            <AppText>Active Challenges: </AppText>
            <AppText style={styles.value}>{testResults.stats.activeChallenges}</AppText>
          </View>
          <View style={styles.resultRow}>
            <AppText>Total Receipts: </AppText>
            <AppText style={styles.value}>{testResults.stats.totalReceipts}</AppText>
          </View>
        </AppCard>
      )}

      {/* Error Display */}
      {testResults.error && (
        <AppCard style={styles.section}>
          <AppText style={styles.sectionTitle}>Error</AppText>
          <AppText style={styles.errorText}>{testResults.error}</AppText>
        </AppCard>
      )}

      {/* Test Info */}
      <AppCard style={styles.section}>
        <AppText style={styles.sectionTitle}>Test Information</AppText>
        <AppText style={styles.infoText}>
          This test verifies if the gill library can successfully read Descipline contract data 
          without encountering the BN initialization errors that affect Anchor in React Native.
        </AppText>
        <AppText style={styles.infoText}>
          If all tests pass, we can use gill for data reading while keeping Anchor for write operations.
        </AppText>
      </AppCard>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    margin: 16,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    color: '#9945ff',
    fontWeight: '600',
  },
  challengeItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  challengeKey: {
    color: '#6b7280',
    minWidth: 100,
  },
  challengeValue: {
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: '#1f1f1f',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  infoText: {
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 8,
  }
})