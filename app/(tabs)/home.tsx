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
  icon?: string
}

function StepCard({ step, title, description, icon }: StepCardProps) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <AppText style={styles.stepNumberText}>{step}</AppText>
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <AppText style={styles.stepTitle}>{title}</AppText>
          {icon && <AppText style={styles.stepIcon}>{icon}</AppText>}
        </View>
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

  // Get recent challenges for display
  const recentChallenges = challenges?.slice(0, 3) || []

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
            <AppText style={styles.appTitle}>DESCIPLINE</AppText>
            <AppText style={styles.subtitle}>
              An open challenge arena where rewards discipline
            </AppText>
            <AppText style={styles.tagline}>
              turns self-driven goals into on-chain accountability
            </AppText>
          </Animated.View>

          {/* How it Works Section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>How it works</AppText>
            <View style={styles.stepsContainer}>
              <StepCard
                step={1}
                title="Set a goal"
                description="An initiator create a challenge."
                icon="🎯"
              />
              <StepCard
                step={2}
                title="Stake commitment"
                description="Challengers Lock funds into a vault."
                icon="💰"
              />
              <StepCard
                step={3}
                title="Prove completion"
                description="Onchain attestation."
                icon="✅"
              />
              <StepCard
                step={4}
                title="Reap rewards"
                description="Winners get stake back + share of losers."
                icon="🏆"
              />
            </View>
          </View>

          {/* Technical Architecture Section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Technical Architecture</AppText>
            <View style={styles.architectureGrid}>
              <View style={styles.architectureCard}>
                <View style={styles.architectureNumber}>
                  <AppText style={styles.architectureNumberText}>1</AppText>
                </View>
                <AppText style={styles.architectureText}>
                  An initiator creates a challenge.
                </AppText>
              </View>
              
              <View style={styles.architectureCard}>
                <View style={styles.architectureNumber}>
                  <AppText style={styles.architectureNumberText}>2</AppText>
                </View>
                <AppText style={styles.architectureText}>
                  Challengers stake funds into a challenge vault.
                </AppText>
              </View>
              
              <View style={styles.architectureCard}>
                <View style={styles.architectureNumber}>
                  <AppText style={styles.architectureNumberText}>3</AppText>
                </View>
                <AppText style={styles.architectureText}>
                  An attestor signs an attestation with merkle root.
                </AppText>
              </View>
              
              <View style={styles.architectureCard}>
                <View style={styles.architectureNumber}>
                  <AppText style={styles.architectureNumberText}>4</AppText>
                </View>
                <AppText style={styles.architectureText}>
                  Winners claim rewards by verifying merkle proof.
                </AppText>
              </View>
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
  appTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: SolanaColors.brand.purple,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
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
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
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
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  architectureGrid: {
    gap: 16,
  },
  architectureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    marginBottom: 12,
  },
  architectureNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 31, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#dc1fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  architectureNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc1fff',
  },
  architectureText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
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
  // Unused styles from old design
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
})