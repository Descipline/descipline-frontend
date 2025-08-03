import { Tabs } from 'expo-router'
import React from 'react'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
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
      
      {/* Account - main wallet functionality */}
      <Tabs.Screen 
        name="account" 
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <UiIconSymbol size={24} name="wallet.pass.fill" color={color} />,
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
      
      {/* Settings */}
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <UiIconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
