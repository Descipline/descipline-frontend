import { useMemo } from 'react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'

// Anchor expects this wallet interface
export interface AnchorWallet {
  publicKey: PublicKey
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>
}

/**
 * Hook that creates an Anchor-compatible wallet from Mobile Wallet Adapter
 * Based on Solana Mobile's official example
 */
export function useAnchorWallet(): AnchorWallet | undefined {
  const { account } = useWalletUi()
  const mobileWallet = useMobileWallet()

  return useMemo(() => {
    if (!account) return undefined

    return {
      publicKey: account.publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
        // Use Mobile Wallet Adapter to sign
        const signedTransactions = await mobileWallet.signTransactions([transaction])
        return signedTransactions[0] as T
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => {
        return await mobileWallet.signTransactions(transactions) as T[]
      }
    }
  }, [mobileWallet, account])
}