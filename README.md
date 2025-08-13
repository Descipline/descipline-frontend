# Descipline Dapp Mobile

Descipline is a decentralized platform that turns self-discipline into real rewards. [>> More Info](https://github.com/Descipline)

---

## 🚀 Quick Start

### 1. **Environment Requirements**

- **anchor-cli 0.30.1**
- **solana-cli 2.2.17**
- **rustc 1.87.0**
- **Node.js 18+**
- **npm** (or yarn/pnpm)
- **Expo CLI**

> _For smart contract development, install Anchor, Solana CLI, and Rust as above._

---

### 2. **Install Dependencies**

```bash
yarn install
```

---

### 3. **Run the App**

```bash
npx expo start
```

- Open in **Expo Go** (scan QR code)
- Or use **Android emulator** / **iOS simulator** / **Web browser**

---

### 4. **Project Structure**

- `app/` — Main app source (file-based routing)
- `components/` — Reusable UI components
- `constants/` — App-wide constants (colors, tokens, etc.)
- `hooks/` — Custom React hooks
- `utils/` — Utility functions and Solana helpers
- `assets/` — Images, icons, fonts
- `android/` — Native Android project (auto-generated)
- `docs/` — Additional documentation

---

### 5. **Scripts & Commands**

- `npm run start` — Start Expo dev server
- `npm run android` — Run on Android device/emulator
- `npm run ios` — Run on iOS simulator
- `npm run web` — Run in web browser
- `npm run lint` — Lint code
- `npm run fmt` — Format code
- `npm run reset-project` — Reset to a blank starter app

---

### 6. **Crypto & Wallet Support**

- Built-in support for Solana wallets via `@solana/web3.js` and `@solana-mobile/mobile-wallet-adapter-protocol`
- SPL token support via `@solana/spl-token`
- Crypto icons: see `CRYPTO_ICONS_SETUP.md`

---

### 7. **App Branding & Icons**

- App icon: `assets/images/logo-desktop.png`
- Splash: `assets/images/splash-icon.png`
- For icon/splash troubleshooting, see `ICON_SETUP_GUIDE.md`

---

### 8. **Smart Contract Integration**

- Smart contracts live in `../descipline-smart-contracts/`
- See that folder's README for contract build/deploy/test
- Update program IDs in frontend if you deploy your own

---

### 9. **Learn More**

- [Expo documentation](https://docs.expo.dev/)
- [Solana docs](https://docs.solana.com/)
- [Anchor docs](https://book.anchor-lang.com/)
- [Solana Mobile Wallet Adapter](https://github.com/solana-mobile/wallet-adapter)

---

### 10. **Community & Support**

- [Expo on GitHub](https://github.com/expo/expo)
- [Solana Discord](https://discord.com/invite/solana)
- [Expo Discord](https://chat.expo.dev)

---

## 🛠️ Development Notes

- This project is based on the official Solana `web3js-expo-paper` template.
- Uses React Native Paper for UI, Expo Router for navigation, and TanStack Query for data fetching.

