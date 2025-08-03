import { Tabs } from 'expo-router'
import React from 'react'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown'

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: SolanaColors.brand.dark,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          color: '#ffffff',
          fontWeight: '600',
        },
        headerRight: () => <WalletUiDropdown />,
        tabBarStyle: {
          backgroundColor: SolanaColors.brand.dark,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        tabBarActiveTintColor: SolanaColors.brand.purple,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* The index redirects to the account screen */}
      <Tabs.Screen name="index" options={{ tabBarItemStyle: { display: 'none' } }} />
      
      {/* Home - main landing page */}
      <Tabs.Screen 
        name="account" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <UiIconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      
      {/* Challenges */}
      <Tabs.Screen 
        name="challenges" 
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color }) => <UiIconSymbol size={24} name="trophy.fill" color={color} />,
        }}
      />
      
      {/* Profile */}
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UiIconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
