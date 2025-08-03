import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { useAuth } from '@/components/auth/auth-provider'
import { handlePostLoginRedirect } from '@/hooks/use-wallet-guard'

export default function SignInScreen() {
  const router = useRouter()
  const { account, signIn, isLoading } = useAuth()
  
  const [modalVisible, setModalVisible] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConnect = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error('Wallet connection error:', error)
    }
  }

  // Auto-redirect when connected
  useEffect(() => {
    if (account) {
      console.log('Wallet connected, handling redirect')
      handlePostLoginRedirect(router)
    }
  }, [account, router])

  return (
    <AppView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#7c3aed', SolanaColors.brand.purple]}
            style={styles.logoContainer}
          >
            <UiIconSymbol name="wallet.pass.fill" size={48} color="#ffffff" />
          </LinearGradient>
          
          <AppText style={styles.title}>Connect Your Wallet</AppText>
          <AppText style={styles.subtitle}>
            Connect your Solana wallet to start participating in challenges
          </AppText>
        </View>

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnect}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7c3aed', SolanaColors.brand.purple]}
              style={styles.connectButtonGradient}
            />
            {isLoading ? (
              <AppText style={styles.connectButtonText}>Connecting...</AppText>
            ) : (
              <>
                <UiIconSymbol name="link" size={20} color="#ffffff" />
                <AppText style={styles.connectButtonText}>CONNECT</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.brand.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  connectButton: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    overflow: 'hidden',
    gap: 12,
  },
  connectButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: 4,
  },
})
