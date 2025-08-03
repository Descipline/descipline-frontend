import { Stack } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SolanaColors } from '@/constants/colors'
import { WalletUiDropdown } from '@/components/solana/wallet-ui-dropdown'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'

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
        options={({ navigation }) => ({
          title: 'Challenge Details',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <UiIconSymbol name="chevron.left" size={20} color="#ffffff" />
            </TouchableOpacity>
          ),
          headerRight: () => <WalletUiDropdown />,
          tabBarStyle: { display: 'none' },
        })}
      />
      <Stack.Screen
        name="create"
        options={({ navigation }) => ({
          title: 'Create Challenge',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <UiIconSymbol name="chevron.left" size={20} color="#ffffff" />
            </TouchableOpacity>
          ),
          headerRight: () => <WalletUiDropdown />,
          tabBarStyle: { display: 'none' },
        })}
      />
    </Stack>
  )
}