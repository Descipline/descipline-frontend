# Architecture Analysis: descipline-dapp-mobile vs amigo-sol-dapp

## Overview
This document analyzes the architectural differences between the new `descipline-dapp-mobile` (based on web3js-expo-paper template) and the existing `amigo-sol-dapp` project.

## Key Architectural Differences

### 1. Navigation Structure

#### descipline-dapp-mobile (Template)
```
app/
├── (tabs)/
│   ├── _layout.tsx         # Standard Expo Router tabs
│   ├── account/            # Nested routes for account features
│   ├── demo/              # Demo features
│   └── settings/          # Settings screens
├── _layout.tsx            # Root layout with auth guard
└── sign-in.tsx           # Sign in screen
```
- Uses **Protected routes** with `Stack.Protected` guard
- Standard Expo Router tabs (not customized)
- Nested route structure for features

#### amigo-sol-dapp
```
app/
├── (tabs)/
│   ├── _layout.tsx         # Custom tab bar implementation
│   ├── home.tsx           # Main landing
│   ├── challenges/        # Challenge features
│   └── profile.tsx        # User profile
├── _layout.tsx            # Simple stack navigator
└── sign-in.tsx           # Sign in screen
```
- Uses **CustomTabBar** component
- No auth guards in navigation
- Flatter route structure

### 2. UI Components

#### descipline-dapp-mobile
- Uses **React Native Paper** for UI
- Basic `UiIconSymbol` component
- Follows Material Design principles
- No custom theme implementation yet

#### amigo-sol-dapp
- **Custom UI components** (AppText, AppView, etc.)
- Uses `expo-symbols` for icons
- Solana-branded design system
- Comprehensive theme with dark mode

### 3. Wallet Integration

#### descipline-dapp-mobile
- Simple auth provider with Mobile Wallet Adapter
- Auth state managed in navigation (`Stack.Protected`)
- Basic wallet connection flow

#### amigo-sol-dapp
- Complex universal wallet system
- Platform detection (mobile vs web)
- Multiple wallet strategies
- Global header with wallet status

### 4. State Management

#### descipline-dapp-mobile
- Basic React Context providers
- Simple auth state
- No advanced caching

#### amigo-sol-dapp
- TanStack Query for data fetching
- Complex provider hierarchy
- Optimistic updates and caching

### 5. Polyfills and Dependencies

#### descipline-dapp-mobile
- Basic polyfills in `polyfill.js`
- Minimal Anchor setup

#### amigo-sol-dapp
- Comprehensive polyfill setup
- Full Anchor integration
- Additional crypto polyfills

## Migration Challenges

### 1. Navigation Paradigm
- **Challenge**: Template uses auth guards, amigo doesn't
- **Solution**: Keep template's auth pattern, adapt amigo screens

### 2. UI Library Conflict
- **Challenge**: Paper vs custom components
- **Solution**: Create Paper-based Solana theme

### 3. Tab Bar Implementation
- **Challenge**: Standard tabs vs custom tab bar
- **Solution**: Override template's tab bar with amigo's CustomTabBar

### 4. Route Structure
- **Challenge**: Nested vs flat routes
- **Solution**: Adapt amigo screens to template's nested structure

### 5. Wallet Connection Flow
- **Challenge**: Different auth patterns
- **Solution**: Use template's auth, enhance with amigo features

## Recommended Migration Path

1. **Keep template's navigation structure** - It's cleaner and has auth built-in
2. **Port UI theme first** - Create Solana-themed Paper components
3. **Replace tab bar early** - Use amigo's CustomTabBar for consistency
4. **Adapt screens individually** - Convert one screen at a time
5. **Add features incrementally** - Start with read-only, then add writes

## Files to Migrate (Priority Order)

### High Priority
1. `constants/colors.ts` - Theme foundation
2. `components/custom-tab-bar.tsx` - Navigation UI
3. `components/global-header.tsx` - Wallet connection UI
4. `utils/descipline/` - Contract integration

### Medium Priority
1. Challenge components
2. Profile components
3. UI components (adapted to Paper)

### Low Priority
1. Advanced features (attestation, resolution)
2. Animations and polish
3. Web-specific code

## Technical Decisions

1. **Use template's auth pattern** - Cleaner and more maintainable
2. **Keep Paper, but theme it** - Don't fight the template
3. **Use template's wallet setup** - Simpler is better
4. **Add TanStack Query later** - Not critical initially