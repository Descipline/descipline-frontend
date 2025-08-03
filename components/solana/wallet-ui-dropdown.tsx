import React, { useState, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Modal, Animated, Linking } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { ellipsify } from '@/utils/ellipsify'
import { useCluster } from '@/components/cluster/cluster-provider'
import { AppText } from '@/components/app-text'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'
import { SolanaColors } from '@/constants/colors'
import { Button, ButtonProps } from 'react-native-paper'

function BaseButton({
  icon,
  label,
  onPress,
  ...props
}: Omit<ButtonProps, 'children'> & {
  label: string
  onPress: () => void
}) {
  return (
    <Button mode="contained-tonal" icon={icon} onPress={onPress} {...props}>
      {label}
    </Button>
  )
}

export function WalletUiConnectButton({ label = 'Connect', then }: { label?: string; then?: () => void }) {
  const { connect } = useWalletUi()

  return <BaseButton icon="wallet" label={label} onPress={() => connect().then(() => then?.())} />
}

export function WalletUiDisconnectButton({ label = 'Disconnect', then }: { label?: string; then?: () => void }) {
  const { disconnect } = useWalletUi()

  return <BaseButton icon="wallet" label={label} onPress={() => disconnect().then(() => then?.())} />
}

export function WalletUiDropdown() {
  const { getExplorerUrl } = useCluster()
  const { account, disconnect } = useWalletUi()
  const [isOpen, setIsOpen] = useState(false)
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  if (!account) {
    return <WalletUiConnectButton then={() => setIsOpen(false)} />
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const openDropdown = () => {
    setIsOpen(true)
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  const closeDropdown = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false)
    })
  }

  const handleCopyAddress = () => {
    Clipboard.setString(account.publicKey.toString())
    closeDropdown()
  }

  const handleViewExplorer = async () => {
    await Linking.openURL(getExplorerUrl(`account/${account.publicKey.toString()}`))
    closeDropdown()
  }

  const handleDisconnect = async () => {
    closeDropdown()
    await disconnect()
  }

  return (
    <>
      <TouchableOpacity
        style={styles.walletButton}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <View style={styles.walletAddressContainer}>
          <View style={styles.onlineIndicator} />
          <AppText style={styles.walletAddress}>
            {formatAddress(account.publicKey.toString())}
          </AppText>
        </View>
        <UiIconSymbol 
          name={isOpen ? "chevron.up" : "chevron.down"} 
          size={16} 
          color="rgba(255, 255, 255, 0.6)" 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeDropdown}
        >
          <View style={styles.dropdownContainer}>
            <Animated.View
              style={[
                styles.dropdown,
                {
                  opacity: opacityAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    })},
                  ],
                },
              ]}
            >
              {/* Wallet Info Section */}
              <View style={styles.dropdownHeader}>
                <View style={styles.walletDetails}>
                  <AppText style={styles.walletLabel}>Connected Wallet</AppText>
                  <AppText style={styles.fullAddress}>
                    {account.publicKey.toString()}
                  </AppText>
                </View>
                <View style={styles.networkBadge}>
                  <View style={styles.networkDot} />
                  <AppText style={styles.networkText}>Devnet</AppText>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Menu Items */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCopyAddress}
                activeOpacity={0.7}
              >
                <UiIconSymbol name="doc.on.doc" size={20} color="rgba(255, 255, 255, 0.7)" />
                <AppText style={styles.menuItemText}>Copy Address</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleViewExplorer}
                activeOpacity={0.7}
              >
                <UiIconSymbol name="safari" size={20} color="rgba(255, 255, 255, 0.7)" />
                <AppText style={styles.menuItemText}>View in Explorer</AppText>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={[styles.menuItem, styles.disconnectItem]}
                onPress={handleDisconnect}
                activeOpacity={0.7}
              >
                <UiIconSymbol name="power" size={20} color="#ef4444" />
                <AppText style={styles.disconnectText}>Disconnect</AppText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    marginRight: 16,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SolanaColors.brand.green,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  dropdownContainer: {
    width: 280,
  },
  dropdown: {
    backgroundColor: SolanaColors.brand.dark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    padding: 16,
  },
  walletDetails: {
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  fullAddress: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 6,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SolanaColors.brand.green,
  },
  networkText: {
    fontSize: 12,
    color: SolanaColors.brand.purple,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  disconnectItem: {
    marginTop: 4,
  },
  disconnectText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
  },
})
