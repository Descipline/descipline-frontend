import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown'
import { router } from 'expo-router'

interface GlobalHeaderProps {
  title?: string
  showBack?: boolean
  showWallet?: boolean
  onBackPress?: () => void
}

export function GlobalHeader({ 
  title, 
  showBack = false, 
  showWallet = true,
  onBackPress
}: GlobalHeaderProps) {
  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
    } else if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)/account')
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        {/* Left side */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <UiIconSymbol name="chevron.left" size={24} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.logoContainer} 
              onPress={() => router.push('/(tabs)/account')}
              activeOpacity={0.7}
            >
              <View style={styles.logoCircle}>
                <AppText style={styles.logoText}>D</AppText>
              </View>
              <AppText style={styles.logoTitle}>Descipline</AppText>
            </TouchableOpacity>
          )}
          
          {title && (
            <AppText style={styles.title}>{title}</AppText>
          )}
        </View>

        {/* Right side - Wallet */}
        {showWallet && (
          <View style={styles.rightSection}>
            <WalletUiDropdown />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SolanaColors.brand.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SolanaColors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})