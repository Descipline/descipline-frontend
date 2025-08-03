import { Tabs } from 'expo-router'
import React from 'react'
import { CustomTabBar } from '@/components/custom-tab-bar'

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* The index redirects to the account screen */}
      <Tabs.Screen name="index" options={{ tabBarItemStyle: { display: 'none' } }} />
      
      {/* Account - main wallet functionality */}
      <Tabs.Screen name="account" />
      
      {/* Challenges */}
      <Tabs.Screen name="challenges" />
      
      {/* Settings */}
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
