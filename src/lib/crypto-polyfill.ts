/**
 * Web Crypto API Polyfill
 *
 * This polyfill ensures that the Web Crypto API is available in all contexts,
 * including Service Workers, Web Workers, and older browsers.
 *
 * The ethers.js library requires Web Crypto API for cryptographic operations.
 */

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Ensure crypto is available on window
  if (!window.crypto) {
    console.warn('Web Crypto API not available on window. Attempting polyfill...');

    // Try to get crypto from globalThis (more modern approach)
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      (window as any).crypto = globalThis.crypto;
    }
    // Try to get crypto from self (for workers)
    else if (typeof self !== 'undefined' && (self as any).crypto) {
      (window as any).crypto = (self as any).crypto;
    }
    // Last resort: create a minimal polyfill
    else {
      console.error('Web Crypto API is not available. Some features may not work.');

      // Create a minimal polyfill for getRandomValues
      const getRandomValues = (array: Uint8Array | Uint16Array | Uint32Array) => {
        // Fallback to Math.random if crypto is not available
        for (let i = 0; i < array.length; i++) {
          if (array instanceof Uint8Array) {
            array[i] = Math.floor(Math.random() * 256);
          } else if (array instanceof Uint16Array) {
            array[i] = Math.floor(Math.random() * 65536);
          } else if (array instanceof Uint32Array) {
            array[i] = Math.floor(Math.random() * 4294967296);
          }
        }
        return array;
      };

      (window as any).crypto = {
        getRandomValues,
        subtle: undefined, // subtle crypto operations not available in polyfill
      };
    }
  }

  // Ensure crypto.subtle is available (required for ethers.js)
  if (window.crypto && !window.crypto.subtle) {
    console.warn('SubtleCrypto API not available. Some cryptographic operations may fail.');
  }
}

// Export empty object to make this a module
export {};
