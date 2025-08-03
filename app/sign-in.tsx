import { router } from 'expo-router'
import { useAuth } from '@/components/auth/auth-provider'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { AppConfig } from '@/constants/app-config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Button } from '@react-navigation/elements'
import { SolanaColors } from '@/constants/colors'

export default function SignIn() {
  const { signIn, isLoading } = useAuth()
  return (
    <AppView
      style={[styles.container, { backgroundColor: SolanaColors.brand.dark }]}
    >
      {isLoading ? (
        <ActivityIndicator color={SolanaColors.brand.purple} />
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {/* Dummy view to push the next view to the center. */}
          <View />
          <View style={styles.centerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <AppText style={styles.logoText}>D</AppText>
              </View>
              <AppText style={styles.title}>Descipline</AppText>
            </View>
            <AppText style={styles.subtitle}>Solana Mobile DApp</AppText>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              variant="filled"
              style={[styles.connectButton, { backgroundColor: SolanaColors.brand.purple }]}
              onPress={async () => {
                await signIn()
                router.replace('/')
              }}
            >
              Connect Wallet
            </Button>
          </View>
        </SafeAreaView>
      )}
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContent: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SolanaColors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  connectButton: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
})
