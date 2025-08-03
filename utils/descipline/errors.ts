export const DESCIPLINE_ERROR_CODES: Record<number, string> = {
  // General errors
  6000: 'Invalid timestamp',
  6001: 'Insufficient balance',
  6002: 'Invalid amount',
  
  // Challenge errors
  6010: 'Challenge already exists',
  6011: 'Challenge not found',
  6012: 'Challenge already ended',
  6013: 'Invalid challenge state',
  
  // Stake errors
  6020: 'Already staked',
  6021: 'Stake period ended',
  6022: 'Invalid stake amount',
  
  // Resolution errors
  6030: 'Not authorized to resolve',
  6031: 'Already resolved',
  6032: 'Cannot resolve before end time',
  
  // Attestation errors
  6040: 'Invalid attestation',
  6041: 'Attestation expired',
  6042: 'Schema mismatch',
}

export function getErrorMessage(error: any): string {
  // Check for Anchor error code
  const errorCode = error?.error?.errorCode?.code || error?.code
  
  if (errorCode && DESCIPLINE_ERROR_CODES[errorCode]) {
    return DESCIPLINE_ERROR_CODES[errorCode]
  }
  
  // Check for custom error message
  if (error?.message) {
    return error.message
  }
  
  // Default error message
  return 'An unknown error occurred'
}

export class DesciplineError extends Error {
  constructor(
    message: string,
    public code?: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'DesciplineError'
  }
}