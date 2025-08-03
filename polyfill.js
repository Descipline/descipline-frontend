import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto'
import { Buffer } from 'buffer'

// Buffer for mobile
global.Buffer = Buffer

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
