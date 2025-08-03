import React, { useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SolanaColors } from '@/constants/colors'
import { TouchableOpacity } from 'react-native'
import { useGetChallengesWithGill } from '@/components/descipline/use-gill-challenge-hooks'
import { ChallengeCard } from '@/components/descipline/challenge-card'

const { width } = Dimensions.get('window')

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  onPress: () => void
  delay?: number
}

function FeatureCard({ icon, title, description, onPress, delay = 0 }: FeatureCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [fadeAnim, slideAnim, scaleAnim, delay])
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.featureCardGradient}
        />
        <View style={styles.featureIconContainer}>
          <AppText style={styles.featureIcon}>{icon}</AppText>
        </View>
        <AppText style={styles.featureTitle}>{title}</AppText>
        <AppText style={styles.featureDescription}>{description}</AppText>
      </TouchableOpacity>
    </Animated.View>
  )
}

interface StepCardProps {
  step: number
  title: string
  description: string
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <AppText style={styles.stepNumberText}>{step}</AppText>
      </View>
      <View style={styles.stepContent}>
        <AppText style={styles.stepTitle}>{title}</AppText>
        <AppText style={styles.stepDescription}>{description}</AppText>
      </View>
    </View>
  )
}

export default function Home() {
  const headerFadeAnim = useRef(new Animated.Value(0)).current
  const headerSlideAnim = useRef(new Animated.Value(-20)).current
  const { data: challenges, isLoading: challengesLoading } = useGetChallengesWithGill()

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [headerFadeAnim, headerSlideAnim])

  // Get recent and popular challenges for display
  const recentChallenges = challenges?.slice(0, 3) || []

  const features = [
    {
      icon: '🏆',
      title: 'Create Challenges',
      description: 'Design fitness challenges with custom rewards and timeframes',
      onPress: () => router.push('/challenges/create'),
    },
    {
      icon: '👥',
      title: 'Join Challenges',
      description: 'Participate in exciting challenges and compete with others',
      onPress: () => router.push('/challenges'),
    },
    {
      icon: '⭐',
      title: 'Earn Rewards',
      description: 'Complete challenges and claim your USDC rewards',
      onPress: () => router.push('/profile'),
    },
  ]

  const steps = [
    {
      step: 1,
      title: 'Connect Wallet',
      description: 'Connect your Solana wallet to get started',
    },
    {
      step: 2,
      title: 'Choose Challenge',
      description: 'Browse and join challenges that interest you',
    },
    {
      step: 3,
      title: 'Stake Tokens',
      description: 'Stake USDC to participate in the challenge',
    },
    {
      step: 4,
      title: 'Complete & Claim',
      description: 'Complete the challenge and claim your rewards',
    },
  ]

  return (
    <AppView style={styles.container}>
      <LinearGradient
        colors={[SolanaColors.brand.dark, '#2a1a3a']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: headerFadeAnim,
                transform: [{ translateY: headerSlideAnim }],
              },
            ]}
          >
            <AppText style={styles.welcomeText}>Welcome to</AppText>
            <AppText style={styles.appTitle}>Descipline</AppText>
            <AppText style={styles.subtitle}>
              Decentralized Challenge Platform on Solana
            </AppText>
          </Animated.View>

          {/* Features Section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Get Started</AppText>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={200 + index * 100} />
              ))}
            </View>
          </View>

          {/* How it Works Section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>How It Works</AppText>
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <StepCard key={index} {...step} />
              ))}
            </View>
          </View>

          {/* Recent Challenges Section */}
          {recentChallenges.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText style={styles.sectionTitle}>Recent Challenges</AppText>
                <TouchableOpacity 
                  onPress={() => router.push('/challenges')}
                  activeOpacity={0.7}
                >
                  <AppText style={styles.viewAllText}>View All</AppText>
                </TouchableOpacity>
              </View>
              <View style={styles.challengesList}>
                {recentChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.publicKey}
                    challenge={challenge}
                    onPress={() => router.push(`/challenges/detail?id=${challenge.publicKey}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={() => router.push('/challenges')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[SolanaColors.brand.purple, '#dc1fff']}
                style={styles.ctaButtonGradient}
              />
              <AppText style={styles.ctaButtonText}>Explore Challenges</AppText>
              <AppText style={styles.ctaButtonIcon}>→</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    minHeight: 120,
    marginBottom: 16,
  },
  featureCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featureIconContainer: {
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    color: SolanaColors.brand.purple,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SolanaColors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: SolanaColors.brand.purple,
    fontWeight: '600',
  },
  challengesList: {
    gap: 8,
  },
  ctaSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  ctaButtonIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
})