/**
 * Import with retry — wraps dynamic import() with automatic retries.
 * Handles "failed to fetch dynamically imported module" errors
 * that occur after deploys when cached HTML references old chunks.
 *
 * Credit: Tea (PR #73)
 * © Andrea Marro — ELAB Tutor
 */

const MAX_RETRIES = 3;
const RETRY_DELAYS = [250, 500, 750];

/**
 * @param {() => Promise<any>} importFn - Function that calls import()
 * @param {number} [retries=MAX_RETRIES] - Max retry count
 * @returns {Promise<any>}
 */
export function importWithRetry(importFn, retries = MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries <= 0) {
          reject(error);
          return;
        }
        const delay = RETRY_DELAYS[MAX_RETRIES - retries] || 750;
        setTimeout(() => {
          importWithRetry(importFn, retries - 1).then(resolve, reject);
        }, delay);
      });
  });
}
