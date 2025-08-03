import { View } from 'react-native'
import { AppText } from '@/components/app-text'
import { GlobalHeader } from '@/components/global-header'
import { AppPage } from '@/components/app-page'

export default function ChallengesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GlobalHeader title="Challenges" />
      <AppPage>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText type="title">Challenges</AppText>
          <AppText>Challenge list will be implemented here</AppText>
        </View>
      </AppPage>
    </View>
  )
}