import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SolanaColors } from '@/constants/colors'

interface StepIconProps {
  size?: number
}

export function TargetIcon({ size = 32 }: StepIconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <LinearGradient
        colors={[SolanaColors.brand.purple, '#dc1fff']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.target, { width: size * 0.8, height: size * 0.8 }]}>
        <View style={[styles.targetRing, { width: size * 0.6, height: size * 0.6 }]} />
        <View style={[styles.targetCenter, { width: size * 0.3, height: size * 0.3 }]} />
      </View>
    </View>
  )
}

export function LockIcon({ size = 32 }: StepIconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <LinearGradient
        colors={['#fbbf24', '#f59e0b']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.lock, { width: size * 0.5, height: size * 0.6 }]}>
        <View style={[styles.lockShackle, { 
          width: size * 0.35, 
          height: size * 0.25,
          borderWidth: size * 0.05 
        }]} />
        <View style={[styles.lockBody, { 
          width: size * 0.5, 
          height: size * 0.35,
          marginTop: size * 0.1 
        }]} />
      </View>
    </View>
  )
}

export function CheckmarkIcon({ size = 32 }: StepIconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.checkmark, { width: size * 0.6, height: size * 0.6 }]}>
        <View style={[styles.checkmarkStroke, { 
          width: size * 0.15, 
          height: size * 0.3,
          borderBottomWidth: size * 0.08,
          borderRightWidth: size * 0.08,
        }]} />
      </View>
    </View>
  )
}

export function TrophyIcon({ size = 32 }: StepIconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.trophy, { width: size * 0.7, height: size * 0.8 }]}>
        <View style={[styles.trophyCup, { 
          width: size * 0.5, 
          height: size * 0.4,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
        }]} />
        <View style={[styles.trophyBase, { 
          width: size * 0.6, 
          height: size * 0.15,
          marginTop: size * 0.05 
        }]} />
        <View style={[styles.trophyStem, { 
          width: size * 0.1, 
          height: size * 0.2,
          marginTop: -size * 0.05 
        }]} />
        {/* Trophy handles */}
        <View style={[styles.trophyHandle, styles.trophyHandleLeft, { 
          width: size * 0.15, 
          height: size * 0.2,
          borderWidth: size * 0.02,
          left: -size * 0.08,
          top: size * 0.1 
        }]} />
        <View style={[styles.trophyHandle, styles.trophyHandleRight, { 
          width: size * 0.15, 
          height: size * 0.2,
          borderWidth: size * 0.02,
          right: -size * 0.08,
          top: size * 0.1 
        }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  // Target Icon
  target: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  targetRing: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
  },
  targetCenter: {
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  
  // Lock Icon
  lock: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lockShackle: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderColor: '#ffffff',
    borderBottomWidth: 0,
  },
  lockBody: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Checkmark Icon
  checkmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkStroke: {
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
    marginLeft: -4,
    marginTop: 2,
  },
  
  // Trophy Icon
  trophy: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trophyCup: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#d97706',
  },
  trophyBase: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  trophyStem: {
    backgroundColor: '#ffffff',
  },
  trophyHandle: {
    borderColor: '#ffffff',
    borderRadius: 20,
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  trophyHandleLeft: {
    borderRightWidth: 0,
  },
  trophyHandleRight: {
    borderLeftWidth: 0,
  },
})