import { safeStorage } from 'electron';

/**
 * Foundation for a DPAPI-backed vault. Persistence is deliberately omitted
 * until profile storage and tests are added in Phase 0.
 */
export function encryptSecret(secret: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('SECURE_STORAGE_UNAVAILABLE');
  }

  return safeStorage.encryptString(secret).toString('base64');
}

export function decryptSecret(ciphertextBase64: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('SECURE_STORAGE_UNAVAILABLE');
  }

  return safeStorage.decryptString(Buffer.from(ciphertextBase64, 'base64'));
}
