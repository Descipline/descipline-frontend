import React from 'react'
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { router } from 'expo-router'

interface TabItem {
  key: string
  title: string
  icon: string
  emoji: string
  route: string
}

interface CustomTabBarProps {
  state: any
  descriptors: any
  navigation: any
}

const tabs: TabItem[] = [
  { key: 'account', title: 'Account', icon: 'wallet.pass.fill', emoji: '💳', route: '/(tabs)/account' },
  { key: 'challenges', title: 'Challenges', icon: 'trophy.fill', emoji: '🏆', route: '/(tabs)/challenges' },
  { key: 'settings', title: 'Settings', icon: 'gearshape.fill', emoji: '⚙️', route: '/(tabs)/settings' },
]

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets()
  const useEmojiIcons = Platform.OS === 'web' && 
    (navigator?.userAgent?.includes('Mobile') || navigator?.userAgent?.includes('Android'))

  const focusedOptions = descriptors[state.routes[state.index].key].options

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'android' ? 8 : 10,
          height: 70,
        }
      ]}>
        {/* Tabs section */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index + 1 // +1 because index route is hidden
            const { options } = descriptors[state.routes[index + 1]?.key] || {}

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[index + 1]?.key,
                canPreventDefault: true,
              })

              if (!isFocused && !event.defaultPrevented) {
                router.push(tab.route)
              }
            }

            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.tabIconContainer}>
                  {useEmojiIcons ? (
                    <AppText style={[
                      styles.emojiIcon,
                      { color: isFocused ? SolanaColors.brand.purple : 'rgba(255, 255, 255, 0.6)' }
                    ]}>
                      {tab.emoji}
                    </AppText>
                  ) : (
                    <UiIconSymbol 
                      size={24} 
                      name={tab.icon} 
                      color={isFocused ? SolanaColors.brand.purple : 'rgba(255, 255, 255, 0.6)'} 
                    />
                  )}
                </View>
                <AppText style={[
                  styles.tabLabel,
                  { color: isFocused ? SolanaColors.brand.purple : 'rgba(255, 255, 255, 0.6)' }
                ]}>
                  {tab.title}
                </AppText>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: SolanaColors.brand.dark,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: SolanaColors.brand.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabIconContainer: {
    marginBottom: 2,
  },
  emojiIcon: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 24,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
})