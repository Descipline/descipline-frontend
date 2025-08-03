import { ChallengeWithDetails } from './types'
import { ChallengeStatus } from './challenge-types'

/**
 * Determines the current status of a challenge based on its properties
 */
export function getChallengeStatus(challenge: ChallengeWithDetails): ChallengeStatus {
  const now = Date.now() / 1000 // Convert to seconds
  
  // If resolved, check if rewards have been claimed
  if (challenge.isResolved) {
    // For now, assume if resolved it's claimable (we don't track individual claims yet)
    return ChallengeStatus.RESOLVED
  }
  
  // Check if staking period has ended
  if (now > challenge.stakeEndAt.toNumber()) {
    return ChallengeStatus.ENDED
  }
  
  // If current time is within staking period
  return ChallengeStatus.ACTIVE
}

/**
 * Checks if a challenge is currently accepting participants
 */
export function isChallengeActive(challenge: ChallengeWithDetails): boolean {
  return getChallengeStatus(challenge) === ChallengeStatus.ACTIVE
}

/**
 * Checks if a challenge can be resolved (ended but not yet resolved)
 */
export function isChallengeResolvable(challenge: ChallengeWithDetails): boolean {
  return getChallengeStatus(challenge) === ChallengeStatus.ENDED
}

/**
 * Checks if rewards can be claimed from a challenge
 */
export function isChallengeClaimable(challenge: ChallengeWithDetails): boolean {
  const status = getChallengeStatus(challenge)
  return status === ChallengeStatus.RESOLVED
}

/**
 * Gets a human-readable description of the challenge status
 */
export function getChallengeStatusDescription(status: ChallengeStatus): string {
  switch (status) {
    case ChallengeStatus.ACTIVE:
      return 'Open for participation'
    case ChallengeStatus.ENDED:
      return 'Ended - waiting for resolution'
    case ChallengeStatus.RESOLVED:
      return 'Resolved - rewards available'
    case ChallengeStatus.CLAIMED:
      return 'Completed'
    default:
      return 'Unknown status'
  }
}

/**
 * Calculates time remaining for a challenge in a specific phase
 */
export function getChallengeTimeRemaining(challenge: ChallengeWithDetails): {
  phase: 'staking' | 'claiming' | 'ended'
  timeRemaining: number // in seconds
  timeRemainingText: string
} {
  const now = Date.now() / 1000
  const stakeEndAt = challenge.stakeEndAt.toNumber()
  const claimStartFrom = challenge.claimStartFrom.toNumber()
  
  if (now < stakeEndAt) {
    const remaining = stakeEndAt - now
    return {
      phase: 'staking',
      timeRemaining: remaining,
      timeRemainingText: formatTimeRemaining(remaining)
    }
  } else if (now < claimStartFrom) {
    const remaining = claimStartFrom - now
    return {
      phase: 'claiming',
      timeRemaining: remaining,
      timeRemainingText: formatTimeRemaining(remaining)
    }
  } else {
    return {
      phase: 'ended',
      timeRemaining: 0,
      timeRemainingText: 'Ended'
    }
  }
}

/**
 * Formats time remaining in a human-readable format
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended'
  
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Calculates the total value locked in a challenge
 */
export function getChallengeTVL(challenge: ChallengeWithDetails): string {
  const stakeAmount = challenge.stakeAmount.toNumber()
  const participantCount = challenge.participantCount
  const totalValue = stakeAmount * participantCount
  
  // Format based on token type
  const tokenSymbol = challenge.tokenAllowed.hasOwnProperty('usdc') ? 'USDC' : 'SOL'
  
  if (totalValue >= 1000) {
    return `${(totalValue / 1000).toFixed(1)}K ${tokenSymbol}`
  } else {
    return `${totalValue} ${tokenSymbol}`
  }
}

/**
 * Gets the token symbol for a challenge
 */
export function getChallengeTokenSymbol(challenge: ChallengeWithDetails): string {
  return challenge.tokenAllowed.hasOwnProperty('usdc') ? 'USDC' : 'SOL'
}