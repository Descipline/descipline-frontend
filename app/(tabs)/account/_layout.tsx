import { Stack } from 'expo-router'
import React from 'react'

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="airdrop" />
      <Stack.Screen name="send" />
      <Stack.Screen name="receive" />
    </Stack>
  )
}
