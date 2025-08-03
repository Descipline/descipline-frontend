/**
 * Basic Connection Test Page
 * Test if basic Solana connection works without Anchor dependencies
 */

import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { AppText } from '@/components/app-text'
import { useConnection } from '@/components/solana/solana-provider'
import { useCluster } from '@/components/cluster/cluster-provider'
import { testGillBasic, testGillProgramAccounts } from '@/utils/gill-simple'
import { testDesciplineContractWithGill, type GillStats, type GillChallengeData } from '@/utils/descipline/gill-challenge-reader'

export default function GillTestScreen() {
  const connection = useConnection()
  const { selectedCluster } = useCluster()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    solanaConnection: boolean | null
    solanaSlot: number | null
    gillBasic: boolean | null
    gillSlot: number | null
    gillProgramAccounts: boolean | null
    gillAccountCount: number | null
    desciplineContract: boolean | null
    desciplineStats: GillStats | null
    desciplineSample: GillChallengeData | null
    error: string | null
  }>({
    solanaConnection: null,
    solanaSlot: null,
    gillBasic: null,
    gillSlot: null,
    gillProgramAccounts: null,
    gillAccountCount: null,
    desciplineContract: null,
    desciplineStats: null,
    desciplineSample: null,
    error: null
  })

  const runAllTests = async () => {
    setLoading(true)
    setTestResults({
      solanaConnection: null,
      solanaSlot: null,
      gillBasic: null,
      gillSlot: null,
      gillProgramAccounts: null,
      gillAccountCount: null,
      desciplineContract: null,
      desciplineStats: null,
      desciplineSample: null,
      error: null
    })

    try {
      console.log('🧪 Starting comprehensive tests...')

      // Test 1: Basic Solana connection
      if (connection && selectedCluster) {
        console.log('🧪 Test 1: Basic Solana connection')
        try {
          const slot = await connection.getSlot()
          setTestResults(prev => ({
            ...prev,
            solanaConnection: true,
            solanaSlot: slot
          }))
          console.log('✅ Solana connection successful, slot:', slot)
        } catch (error) {
          setTestResults(prev => ({
            ...prev,
            solanaConnection: false,
            error: `Solana: ${error.message}`
          }))
          console.error('❌ Solana connection failed:', error)
        }
      }

      // Test 2: Gill basic functionality
      console.log('🧪 Test 2: Gill basic functionality')
      try {
        const gillResult = await testGillBasic()
        setTestResults(prev => ({
          ...prev,
          gillBasic: gillResult.success,
          gillSlot: gillResult.slot || null
        }))
        
        if (!gillResult.success) {
          throw new Error(gillResult.error)
        }
        console.log('✅ Gill basic test successful')
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          gillBasic: false,
          error: `Gill Basic: ${error.message}`
        }))
        console.error('❌ Gill basic test failed:', error)
      }

      // Test 3: Gill program accounts
      console.log('🧪 Test 3: Gill program accounts')
      try {
        const accountResult = await testGillProgramAccounts()
        setTestResults(prev => ({
          ...prev,
          gillProgramAccounts: accountResult.success,
          gillAccountCount: accountResult.accountCount || null
        }))
        
        if (!accountResult.success) {
          throw new Error(accountResult.error)
        }
        console.log('✅ Gill program accounts test successful')
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          gillProgramAccounts: false,
          error: prev.error ? `${prev.error}; Gill Accounts: ${error.message}` : `Gill Accounts: ${error.message}`
        }))
        console.error('❌ Gill program accounts test failed:', error)
      }

      // Test 4: Descipline contract specific
      console.log('🧪 Test 4: Descipline contract with Gill')
      try {
        const desciplineResult = await testDesciplineContractWithGill(selectedCluster?.endpoint)
        setTestResults(prev => ({
          ...prev,
          desciplineContract: desciplineResult.success,
          desciplineStats: desciplineResult.stats || null,
          desciplineSample: desciplineResult.sampleChallenge || null
        }))
        
        if (!desciplineResult.success) {
          throw new Error(desciplineResult.error)
        }
        console.log('✅ Descipline contract test successful')
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          desciplineContract: false,
          error: prev.error ? `${prev.error}; Descipline: ${error.message}` : `Descipline: ${error.message}`
        }))
        console.error('❌ Descipline contract test failed:', error)
      }

      console.log('🧪 All tests completed')
      Alert.alert('Tests Complete', 'Check results below. If Descipline test passes, we can use Gill!')

    } catch (error: any) {
      console.error('❌ Test suite error:', error)
      setTestResults(prev => ({
        ...prev,
        error: error.message || 'Unknown error'
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run test when component mounts
    if (connection && selectedCluster) {
      runAllTests()
    }
  }, [connection, selectedCluster])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <AppText style={styles.title}>Solana vs Gill Test</AppText>
        <AppText style={styles.subtitle}>
          Comparing standard Solana Web3.js with Gill library
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Test Controls</AppText>
        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
          onPress={runAllTests}
          disabled={loading}
        >
          <AppText style={styles.buttonText}>
            {loading ? "Running Tests..." : "Run All Tests"}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Solana Connection Test */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Solana Web3.js Test</AppText>
        <View style={styles.resultRow}>
          <AppText>Status: </AppText>
          <AppText style={[
            styles.status,
            { color: testResults.solanaConnection === true ? '#4ade80' : 
                     testResults.solanaConnection === false ? '#ef4444' : '#6b7280' }
          ]}>
            {testResults.solanaConnection === true ? 'SUCCESS' : 
             testResults.solanaConnection === false ? 'FAILED' : 'PENDING'}
          </AppText>
        </View>
        {testResults.solanaSlot && (
          <View style={styles.resultRow}>
            <AppText>Slot: </AppText>
            <AppText style={styles.value}>{testResults.solanaSlot}</AppText>
          </View>
        )}
      </View>

      {/* Gill Basic Test */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Gill Basic Test</AppText>
        <View style={styles.resultRow}>
          <AppText>Status: </AppText>
          <AppText style={[
            styles.status,
            { color: testResults.gillBasic === true ? '#4ade80' : 
                     testResults.gillBasic === false ? '#ef4444' : '#6b7280' }
          ]}>
            {testResults.gillBasic === true ? 'SUCCESS' : 
             testResults.gillBasic === false ? 'FAILED' : 'PENDING'}
          </AppText>
        </View>
        {testResults.gillSlot && (
          <View style={styles.resultRow}>
            <AppText>Slot: </AppText>
            <AppText style={styles.value}>{testResults.gillSlot}</AppText>
          </View>
        )}
      </View>

      {/* Gill Program Accounts Test */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Gill Program Accounts Test</AppText>
        <View style={styles.resultRow}>
          <AppText>Status: </AppText>
          <AppText style={[
            styles.status,
            { color: testResults.gillProgramAccounts === true ? '#4ade80' : 
                     testResults.gillProgramAccounts === false ? '#ef4444' : '#6b7280' }
          ]}>
            {testResults.gillProgramAccounts === true ? 'SUCCESS' : 
             testResults.gillProgramAccounts === false ? 'FAILED' : 'PENDING'}
          </AppText>
        </View>
        {testResults.gillAccountCount !== null && (
          <View style={styles.resultRow}>
            <AppText>Accounts Found: </AppText>
            <AppText style={styles.value}>{testResults.gillAccountCount}</AppText>
          </View>
        )}
      </View>

      {/* Descipline Contract Test */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Descipline Contract Test</AppText>
        <View style={styles.resultRow}>
          <AppText>Status: </AppText>
          <AppText style={[
            styles.status,
            { color: testResults.desciplineContract === true ? '#4ade80' : 
                     testResults.desciplineContract === false ? '#ef4444' : '#6b7280' }
          ]}>
            {testResults.desciplineContract === true ? 'SUCCESS' : 
             testResults.desciplineContract === false ? 'FAILED' : 'PENDING'}
          </AppText>
        </View>
        
        {testResults.desciplineStats && (
          <>
            <View style={styles.resultRow}>
              <AppText>Total Challenges: </AppText>
              <AppText style={styles.value}>{testResults.desciplineStats.totalChallenges}</AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText>Active Challenges: </AppText>
              <AppText style={styles.value}>{testResults.desciplineStats.activeChallenges}</AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText>Total Receipts: </AppText>
              <AppText style={styles.value}>{testResults.desciplineStats.totalReceipts}</AppText>
            </View>
          </>
        )}
        
        {testResults.desciplineSample && (
          <View style={styles.sampleChallenge}>
            <AppText style={styles.sampleTitle}>Sample Challenge:</AppText>
            <AppText style={styles.sampleText}>Name: {testResults.desciplineSample.name}</AppText>
            <AppText style={styles.sampleText}>Token: {testResults.desciplineSample.tokenAllowed}</AppText>
            <AppText style={styles.sampleText}>Active: {testResults.desciplineSample.isActive ? 'Yes' : 'No'}</AppText>
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
          This test compares standard Solana Web3.js with the Gill library for React Native compatibility.
        </AppText>
        <AppText style={styles.infoText}>
          If Gill tests pass, we can use it as an alternative to Anchor for reading contract data.
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
  },
  sampleChallenge: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9945ff',
  },
  sampleTitle: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  sampleText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  }
})