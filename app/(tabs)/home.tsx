import React, { useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Dimensions, Animated, ImageBackground, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SolanaColors } from '@/constants/colors'
import { TouchableOpacity } from 'react-native'
import { useGetChallengesWithGill } from '@/components/descipline/use-gill-challenge-hooks'
import { ChallengeCard } from '@/components/descipline/challenge-card'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Ionicons from '@expo/vector-icons/Ionicons'

const { width, height } = Dimensions.get('window')

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  delay?: number
}

function StatCard({ title, value, icon, delay = 0 }: StatCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [fadeAnim, slideAnim, delay])
  
  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(153, 69, 255, 0.15)', 'rgba(220, 31, 255, 0.05)']}
        style={styles.statCardGradient}
      />
      <View style={styles.statIcon}>
        <UiIconSymbol name={icon} size={24} color={SolanaColors.brand.purple} />
      </View>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statTitle}>{title}</AppText>
    </Animated.View>
  )
}

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  gradient: string[]
  delay?: number
}

function FeatureCard({ icon, title, description, gradient, delay = 0 }: FeatureCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  
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
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [fadeAnim, slideAnim, scaleAnim, delay])
  
  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={styles.featureCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.featureIconContainer}>
        <UiIconSymbol name={icon} size={28} color="#ffffff" />
      </View>
      <AppText style={styles.featureTitle}>{title}</AppText>
      <AppText style={styles.featureDescription}>{description}</AppText>
    </Animated.View>
  )
}

interface StepCardProps {
  step: number
  title: string
  description: string
  iconName: string
  iconLibrary: 'MaterialIcons' | 'FontAwesome5' | 'Ionicons'
  iconColor: string
}

function StepCard({ step, title, description, iconName, iconLibrary, iconColor }: StepCardProps) {
  const renderIcon = () => {
    const iconProps = { name: iconName, size: 28, color: iconColor }
    
    switch (iconLibrary) {
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} />
      case 'Ionicons':
        return <Ionicons {...iconProps} />
      default:
        return <MaterialIcons {...iconProps} />
    }
  }

  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <AppText style={styles.stepNumberText}>{step}</AppText>
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <AppText style={styles.stepTitle}>{title}</AppText>
          <View style={styles.stepIconContainer}>
            {renderIcon()}
          </View>
        </View>
        <AppText style={styles.stepDescription}>{description}</AppText>
      </View>
    </View>
  )
}

export default function Home() {
  const headerFadeAnim = useRef(new Animated.Value(0)).current
  const headerSlideAnim = useRef(new Animated.Value(-30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  
  const { data: challenges, isLoading: challengesLoading } = useGetChallengesWithGill()

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for CTA button
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ])
    
    Animated.loop(pulse).start()
  }, [headerFadeAnim, headerSlideAnim, pulseAnim])

  // Get recent challenges for display
  const recentChallenges = challenges?.slice(0, 2) || []

  return (
    <AppView style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={['#1a0d2e', '#2d1b4e', '#1a0d2e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <LinearGradient
                colors={['rgba(153, 69, 255, 0.3)', 'rgba(220, 31, 255, 0.3)']}
                style={styles.heroBadgeGradient}
              />
              <UiIconSymbol name="sparkles" size={16} color="#ffffff" />
              <AppText style={styles.heroBadgeText}>Built on Solana</AppText>
            </View>
            
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/adaptive-icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            <AppText style={styles.heroTitle}>DESCIPLINE</AppText>
            <AppText style={styles.heroSubtitle}>
              An open challenge arena where discipline is rewarded.
            </AppText>
            <AppText style={styles.heroDescription}>
               
            </AppText>
            <AppText style={styles.heroDescription}>
               
            </AppText>

            <Animated.View
              style={[
                styles.heroButtons,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={() => router.push('/(tabs)/challenges')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[SolanaColors.brand.purple, '#dc1fff']}
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <AppText style={styles.primaryButtonText}>Start Challenge</AppText>
                <UiIconSymbol name="arrow.right" size={18} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <AppText style={styles.sectionTitle}>Why DESCIPLINE?</AppText>
          
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="shield.checkered"
              title="Blockchain Verified"
              description="Your progress is immutably recorded on Solana blockchain"
              gradient={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']}
              delay={0}
            />
            <FeatureCard
              icon="dollarsign.circle.fill"
              title="Stake to Win"
              description="Put your money where your goals are. Winners take all"
              gradient={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']}
              delay={200}
            />
            <FeatureCard
              icon="person.2.fill"
              title="Community Driven"
              description="Join challenges with others or create your own"
              gradient={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
              delay={400}
            />
            <FeatureCard
              icon="checkmark.seal.fill"
              title="Provable Results"
              description="Smart contracts ensure fair and transparent outcomes"
              gradient={['rgba(168, 85, 247, 0.2)', 'rgba(168, 85, 247, 0.05)']}
              delay={600}
            />
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.workflowSection}>
          <AppText style={styles.sectionTitle}>How It Works</AppText>
          <AppText style={styles.sectionSubtitle}>
            Four simple steps to turn your goals into guaranteed outcomes
          </AppText>
          
          <View style={styles.stepsContainer}>
            <StepCard
              step={1}
              title="Set Your Challenge"
              description="Define your goal and set the stakes. The bigger the commitment, the stronger the motivation."
              iconName="rocket-launch"
              iconLibrary="MaterialIcons"
              iconColor="#f59e0b"
            />
            <StepCard
              step={2}
              title="Lock Your Stake"
              description="Put your money where your mouth is. Stake USDC or SOL to join the challenge."
              iconName="diamond"
              iconLibrary="FontAwesome5"
              iconColor="#06b6d4"
            />
            <StepCard
              step={3}
              title="Prove Your Progress"
              description="Submit verifiable proof of completion through our attestation system."
              iconName="shield-checkmark"
              iconLibrary="Ionicons"
              iconColor="#10b981"
            />
            <StepCard
              step={4}
              title="Claim Your Rewards"
              description="Winners get their stake back plus a share of what the quitters lost."
              iconName="celebration"
              iconLibrary="MaterialIcons"
              iconColor="#f59e0b"
            />
          </View>
        </View>


        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <LinearGradient
            colors={['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)']}
            style={styles.bottomCTAGradient}
          />
          <AppText style={styles.ctaTitle}>Ready to Challenge Yourself?</AppText>
          <AppText style={styles.ctaDescription}>
            Join thousands turning discipline into decentralized success
          </AppText>
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)/challenges')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[SolanaColors.brand.purple, '#dc1fff']}
              style={styles.ctaButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <UiIconSymbol name="rocket.fill" size={20} color="#ffffff" />
            <AppText style={styles.ctaButtonText}>Start Your Journey</AppText>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
    paddingBottom: 0,
  },
  
  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width - 48,
    paddingTop: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    overflow: 'hidden',
  },
  heroBadgeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    fontSize: Math.min(48, width * 0.12),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    lineHeight: Math.min(56, width * 0.14),
  },
  heroSubtitle: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: '600',
    color: SolanaColors.brand.purple,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: Math.min(28, width * 0.07),
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  heroButtons: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 8,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 8,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: (width - 64) / 2,
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  featureCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featureIconContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },

  // Workflow Section
  workflowSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
    fontSize: Math.min(28, width * 0.07),
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: Math.min(34, width * 0.085),
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  stepsContainer: {
    gap: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepIconContainer: {
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },

  // Challenges Section
  challengesSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
  },
  viewAllText: {
    fontSize: 14,
    color: SolanaColors.brand.purple,
    fontWeight: '600',
    marginRight: 4,
  },
  challengesList: {
    gap: 16,
  },

  // Bottom CTA
  bottomCTA: {
    marginHorizontal: 24,
    marginTop: 40,
    marginBottom: 40,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.3)',
    overflow: 'hidden',
  },
  bottomCTAGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 6,
    shadowColor: SolanaColors.brand.purple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },

  // Utility
  bottomPadding: {
    height: 32,
  },

  // Stat Cards (unused but keeping for potential future use)
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  statCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
})