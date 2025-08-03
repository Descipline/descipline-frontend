# Descipline Mobile DApp Migration Plan

## 📱 Project Overview
Migrating Descipline functionality from `amigo-sol-dapp` to the new `descipline-dapp-mobile` project based on Solana's official `web3js-expo-paper` template.

## 🎯 Migration Strategy
1. **Maintain Template Stability** - Keep the official template structure intact
2. **Incremental Migration** - Port features one by one to ensure app remains runnable
3. **Mobile-First** - Focus on Android functionality before web compatibility

## 📋 Migration TODO List

### Phase 1: Project Setup & Analysis 🔍
- [x] Analyze differences between `descipline-dapp-mobile` and `amigo-sol-dapp` architectures
- [x] Document routing differences (Expo Router in both, but different structures)
- [x] Identify compatible vs incompatible components
- [x] Create migration priority list based on dependencies

### Phase 2: Core Infrastructure 🏗️
- [ ] Copy `utils/descipline/` folder from amigo (IDL, types, constants)
- [ ] Install missing dependencies (@coral-xyz/anchor, etc.)
- [ ] Setup polyfills if needed (check if template already has them)
- [ ] Configure TypeScript paths for cleaner imports

### Phase 3: UI Foundation 🎨
- [ ] Migrate color scheme from amigo's `constants/colors.ts`
- [ ] Adapt UI components to React Native Paper (template uses Paper)
- [ ] Create Solana-themed Paper components
- [ ] Ensure dark theme is properly configured
- [ ] Migrate custom bottom navigation bar (CustomTabBar)
- [ ] Migrate global header with wallet connect button (top left)
- [ ] Port sign-in screen with wallet connection flow
- [ ] Implement wallet connection state management in navigation

### Phase 4: Descipline Provider & Hooks 🪝
- [ ] Port `components/descipline/descipline-provider.tsx`
- [ ] Migrate challenge hooks (`use-challenge-hooks.ts`)
- [ ] Adapt hooks to template's wallet connection pattern
- [ ] Test basic contract queries

### Phase 5: Navigation & Screens 📱
- [ ] Replace demo tab with challenges tab
- [ ] Create challenges list screen
- [ ] Create challenge detail screen
- [ ] Create challenge creation screen
- [ ] Add profile/stats to settings tab

### Phase 6: Challenge Features ⚡
- [ ] Implement challenge list functionality
- [ ] Add challenge creation flow
- [ ] Implement stake/participation
- [ ] Add challenge resolution (creator only)
- [ ] Implement reward claiming

### Phase 7: UI Components 🎯
- [ ] Port challenge card components
- [ ] Migrate status badges
- [ ] Port participant list
- [ ] Adapt modals to Paper components
- [ ] Add loading states and error handling

### Phase 8: Profile & Stats 📊
- [ ] Create user stats display
- [ ] Show user's created challenges
- [ ] Display participation history
- [ ] Add rewards tracking

### Phase 9: Testing & Optimization 🧪
- [ ] Test all flows on Android device
- [ ] Verify wallet connections work
- [ ] Check transaction signing
- [ ] Optimize performance
- [ ] Handle edge cases

### Phase 10: Polish & Documentation 🚀
- [ ] Update app.json with Descipline branding
- [ ] Create proper README
- [ ] Document any template modifications
- [ ] Prepare for deployment

## 🚨 Critical Differences to Handle

### Navigation Structure
- **Template**: Uses `(tabs)` folder with nested routes
- **Amigo**: Uses flat structure with `_layout.tsx` files
- **Strategy**: Keep template structure, adapt amigo screens

### Wallet Integration
- **Template**: Has auth provider with mobile wallet adapter
- **Amigo**: Has more complex universal wallet system
- **Strategy**: Use template's simpler approach

### UI Library
- **Template**: React Native Paper
- **Amigo**: Custom components + expo-symbols
- **Strategy**: Adapt to Paper components, maintain Solana theme

### State Management
- **Template**: Basic React Context
- **Amigo**: Context + TanStack Query
- **Strategy**: Keep template pattern, add Query where needed

## 📌 Priority Order

1. **Get IDL and types working** (Phase 2)
2. **Basic challenge list display** (Phase 5)
3. **Challenge details view** (Phase 5)
4. **Participation flow** (Phase 6)
5. **Creation flow** (Phase 6)
6. **Profile features** (Phase 8)

## 🔧 Development Notes

- Always ensure the app runs after each change
- Test on real device frequently
- Keep commits small and focused
- Document any workarounds needed

## 📱 Testing Checklist

- [ ] App launches without errors
- [ ] Wallet connection works
- [ ] Can fetch challenges from contract
- [ ] Can view challenge details
- [ ] Can participate in challenges
- [ ] Can create new challenges
- [ ] Profile data loads correctly
- [ ] All transactions sign properly