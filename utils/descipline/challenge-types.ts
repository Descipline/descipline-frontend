export enum ChallengeStatus {
  ACTIVE = "active",      // Can participate
  ENDED = "ended",        // Ended, waiting for resolution
  RESOLVED = "resolved",  // Resolved, can claim rewards
  CLAIMED = "claimed"     // All rewards claimed
}

export interface UserParticipation {
  isParticipant: boolean
  stakeAmount?: number
  canClaim?: boolean
  hasClaimed?: boolean
  isWinner?: boolean
  participationTime?: Date
}

export interface ChallengeParticipant {
  address: string
  stakeAmount: number
  participationTime: Date
  isWinner?: boolean
  hasClaimed?: boolean
}

export function getChallengeStatus(challenge: any): ChallengeStatus {
  const now = new Date()
  const endTime = new Date(challenge.stakeEndAt.toNumber() * 1000)
  const claimTime = new Date(challenge.claimStartFrom.toNumber() * 1000)
  
  if (!challenge.isResolved) {
    return endTime < now ? ChallengeStatus.ENDED : ChallengeStatus.ACTIVE
  }
  
  if (challenge.isResolved && claimTime > now) {
    return ChallengeStatus.RESOLVED
  }
  
  // TODO: Check if all rewards have been claimed
  return ChallengeStatus.RESOLVED
}

export function getStatusColor(status: ChallengeStatus): string {
  switch (status) {
    case ChallengeStatus.ACTIVE:
      return '#10b981' // green
    case ChallengeStatus.ENDED:
      return '#f59e0b' // amber
    case ChallengeStatus.RESOLVED:
      return '#3b82f6' // blue
    case ChallengeStatus.CLAIMED:
      return '#6b7280' // gray
    default:
      return '#6b7280'
  }
}

export function getStatusEmoji(status: ChallengeStatus): string {
  switch (status) {
    case ChallengeStatus.ACTIVE:
      return '🔥'
    case ChallengeStatus.ENDED:
      return '⏰'
    case ChallengeStatus.RESOLVED:
      return '✅'
    case ChallengeStatus.CLAIMED:
      return '🏆'
    default:
      return '❓'
  }
}