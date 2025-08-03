/**
 * Solana-inspired color scheme based on official Solana websites
 * - Deep dark backgrounds with purple gradients
 * - High contrast white/gray text
 * - Subtle borders and card backgrounds
 */

// Solana brand colors
const solanaPurple = '#9945ff'
const solanaGreen = '#14f195'
const solanaDark = '#0a0a0a'
const solanaGray = '#1a1a1a'

export const Colors = {
  light: {
    background: '#fafafa',
    card: '#ffffff',
    border: '#e5e5e5',
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: solanaPurple,
    text: '#1f2937',
    textSecondary: '#6b7280',
    tint: solanaPurple,
    accent: solanaGreen,
  },
  dark: {
    background: solanaGray,
    card: '#2a2a2a',
    border: '#404040',
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: solanaPurple,
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    tint: solanaPurple,
    accent: solanaGreen,
  },
}

// Solana-specific gradients and effects
export const SolanaColors = {
  gradients: {
    primary: [solanaPurple, '#dc1fff'],
    background: [solanaGray, solanaGray],
    card: ['rgba(153, 69, 255, 0.1)', 'rgba(220, 31, 255, 0.05)'],
  },
  surfaces: {
    elevated: 'rgba(255, 255, 255, 0.05)',
    hover: 'rgba(153, 69, 255, 0.1)',
  },
  brand: {
    purple: solanaPurple,
    green: solanaGreen,
    dark: solanaGray,
  }
}