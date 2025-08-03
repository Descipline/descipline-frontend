// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SymbolViewProps, SymbolWeight } from 'expo-symbols'
import { ComponentProps } from 'react'
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native'

type UiIconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>
export type UiIconSymbolName = keyof typeof MAPPING

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'gearshape.fill': 'settings',
  'wallet.pass.fill': 'wallet',
  'ladybug.fill': 'bug-report',
  'house.fill': 'home',
  'trophy.fill': 'emoji-events',
  'person.fill': 'person',
  'power': 'power-settings-new',
  'chart.bar.fill': 'bar-chart',
  'plus.app': 'add-box',
  'person.2': 'group',
  'link': 'link',
  'hourglass': 'hourglass-empty',
  'dollarsign.circle.fill': 'attach-money',
  'dollarsign.circle': 'attach-money',
  'clock.fill': 'schedule',
  'play.circle.fill': 'play-circle-filled',
  'checkmark.circle.fill': 'check-circle',
  'trophy': 'emoji-events',
  'person.2.fill': 'group',
  'star.fill': 'star',
  'arrow.right': 'arrow-forward',
} as UiIconMapping

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function UiIconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: UiIconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />
}
