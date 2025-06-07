import * as xrpl from 'xrpl';

/**
 * Generates a DID for an XRPL account (did:xrpl method).
 * Format: `did:xrpl:<account-address>`
 */
export function generateXrplDid(accountAddress: string): string {
  // Ensure the address is valid
  if (!xrpl.isValidAddress(accountAddress)) {
    throw new Error('Invalid XRPL address');
  }
  return `did:xrpl:${accountAddress}`;
} 