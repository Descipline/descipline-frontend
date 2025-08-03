/**
 * Basic Connection Test Page
 * Test if basic Solana connection works without Anchor dependencies
 */

import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { AppText } from '@/components/app-text'
import { useConnection } from '@/components/solana/solana-provider'
import { useCluster } from '@/components/cluster/cluster-provider'

export default function GillTestScreen() {
  const connection = useConnection()
  const { selectedCluster } = useCluster()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    connection: boolean | null
    slot: number | null
    error: string | null
  }>({
    connection: null,
    slot: null,
    error: null
  })

  const runBasicTest = async () => {
    if (!connection || !selectedCluster) {
      Alert.alert('Error', 'No Solana connection or cluster available')
      return
    }

    setLoading(true)
    setTestResults({
      connection: null,
      slot: null,
      error: null
    })

    try {
      console.log('🧪 Starting basic Solana connection test...')
      console.log('🧪 Using RPC:', selectedCluster.endpoint)

      // Test basic connection by getting current slot
      const slot = await connection.getSlot()
      console.log('🧪 Current slot:', slot)
      
      setTestResults({
        connection: true,
        slot: slot,
        error: null
      })

      console.log('✅ Basic connection test successful!')
      Alert.alert('Success', `Connection test successful! Current slot: ${slot}`)

    } catch (error: any) {
      console.error('❌ Connection test error:', error)
      setTestResults({
        connection: false,
        slot: null,
        error: error.message || 'Unknown error'
      })
      Alert.alert('Error', `Connection test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run test when component mounts
    if (connection && selectedCluster) {
      runBasicTest()
    }
  }, [connection, selectedCluster])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <AppText style={styles.title}>Basic Connection Test</AppText>
        <AppText style={styles.subtitle}>
          Testing basic Solana connection without Anchor/Gill dependencies
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Test Controls</AppText>
        <TouchableOpacity
          style={[styles.button, { opacity: loading || !connection ? 0.5 : 1 }]}
          onPress={runBasicTest}
          disabled={loading || !connection}
        >
          <AppText style={styles.buttonText}>
            {loading ? "Running Test..." : "Run Connection Test"}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Connection Test Results */}
      <View style={styles.card}>
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
        {testResults.slot && (
          <View style={styles.resultRow}>
            <AppText>Current Slot: </AppText>
            <AppText style={styles.value}>{testResults.slot}</AppText>
          </View>
        )}
      </View>

      {/* Error Display */}
      {testResults.error && (
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Error</AppText>
          <AppText style={styles.errorText}>{testResults.error}</AppText>
        </View>
      )}

      {/* Test Info */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Test Information</AppText>
        <AppText style={styles.infoText}>
          This test verifies basic Solana connection functionality without using Anchor or Gill libraries.
        </AppText>
        <AppText style={styles.infoText}>
          If this test passes, we can then investigate why Anchor/Gill have compatibility issues.
        </AppText>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#9945ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
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