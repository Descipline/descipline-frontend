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
  // Create challenge page icons
  'info.circle.fill': 'info',
  'pencil': 'edit',
  'banknote': 'money',
  'percent': 'percent',
  'calendar': 'calendar-today',
  'chevron.down': 'keyboard-arrow-down',
  'play.fill': 'play-arrow',
  'stop.fill': 'stop',
  'gift.fill': 'card-giftcard',
  'plus.circle.fill': 'add-circle',
  'chevron.left': 'chevron-left',
  // Success and modal icons
  'eye.fill': 'visibility',
  'plus.circle': 'add-circle-outline',
  'list.bullet': 'list',
  '1.circle.fill': 'looks-one',
  '2.circle.fill': 'looks-two',
  '3.circle.fill': 'looks-3',
  // Modal and confirmation icons
  'doc.on.doc': 'content-copy',
  'xmark': 'close',
  'person.3.fill': 'group',
  'clock': 'access-time',
  'crown.fill': 'emoji-events',
  'arrow.triangle.2.circlepath': 'sync',
  'exclamationmark.triangle.fill': 'warning',
  // Status and participation icons
  'person.3': 'group',
  'checkmark.shield.fill': 'verified',
  'gift': 'card-giftcard',
  'flag.fill': 'flag',
  'clock.arrow.circlepath': 'update',
  // Transaction modal icons
  'gear': 'settings',
  'hand.raised.fill': 'pan-tool',
  'paperplane.fill': 'send',
  'xmark.circle.fill': 'cancel',
  'safari': 'open-in-browser',
  'arrow.right.circle.fill': 'arrow-circle-right',
  'lightbulb.fill': 'lightbulb',
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
