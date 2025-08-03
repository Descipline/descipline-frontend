import { Stack } from 'expo-router'
import { SolanaColors } from '@/constants/colors'
import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown'

export default function ChallengesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: SolanaColors.brand.dark,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          color: '#ffffff',
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          title: 'Challenge Details',
          headerShown: true,
          headerRight: () => <WalletUiDropdown />,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Challenge',
          headerShown: true,
          headerRight: () => <WalletUiDropdown />,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Stack>
  )
}