import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto'
import { Buffer } from 'buffer'

// Essential polyfills for Solana/Anchor on React Native
global.Buffer = Buffer

// Fix BN initialization based on Stack Overflow solutions
// Multiple approaches to ensure BN is available for Anchor 0.31.0
try {
  // Method 1: Import BN from @coral-xyz/anchor (most reliable for Anchor 0.31.0)
  const { BN: AnchorBN } = require('@coral-xyz/anchor')
  if (AnchorBN && typeof AnchorBN === 'function') {
    global.BN = AnchorBN
    console.log('✅ BN polyfill: Successfully loaded from @coral-xyz/anchor')
  } else {
    // Method 2: Import from @solana/web3.js
    const { BN: SolanaBN } = require('@solana/web3.js')
    if (SolanaBN && typeof SolanaBN === 'function') {
      global.BN = SolanaBN
      console.log('✅ BN polyfill: Successfully loaded from @solana/web3.js')
    } else {
      // Method 3: Direct bn.js import as final fallback
      const BNFallback = require('bn.js')
      global.BN = BNFallback
      console.log('✅ BN polyfill: Using bn.js fallback')
    }
  }
  
  // Verify BN is working by testing basic functionality
  const testBN = new global.BN(100)
  if (testBN.toString() === '100') {
    console.log('✅ BN polyfill: Verification successful')
  } else {
    throw new Error('BN verification failed')
  }
  
} catch (error) {
  console.error('❌ BN polyfill completely failed:', error.message)
  // Last resort: provide a minimal BN implementation
  global.BN = class MinimalBN {
    constructor(value) {
      this._value = typeof value === 'string' ? parseInt(value) : value
    }
    toString() {
      return this._value.toString()
    }
  }
  console.warn('⚠️ Using minimal BN fallback - may cause issues')
}

// TextEncoder polyfill - required for Solana
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder
}

// structuredClone polyfill optimized for React Native and Anchor IDL
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function(obj) {
    try {
      // For simple objects (like IDL), JSON method is sufficient and fast
      return JSON.parse(JSON.stringify(obj))
    } catch (error) {
      console.warn('structuredClone fallback failed:', error)
      // Fallback to simple object spread for React Native
      if (Array.isArray(obj)) {
        return [...obj]
      }
      if (obj && typeof obj === 'object') {
        return { ...obj }
      }
      return obj
    }
  }
}

// Crypto for mobile  
class Crypto {
  getRandomValues = expoCryptoGetRandomValues
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto()

if (typeof crypto === 'undefined') {
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  })
}
