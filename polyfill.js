import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto'
import { Buffer } from 'buffer'

// Essential polyfills for Solana/Anchor on React Native
global.Buffer = Buffer

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
