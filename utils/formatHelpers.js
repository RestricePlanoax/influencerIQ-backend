// utils/formatHelpers.js

/**
 * Helpers for formatting currency, etc.
 */

export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  /** 
   * Simple utility to “jitter” a base fitScore in [0,1]. 
   */
  export function computeFitScore(baseScore = 0.5) {
    const jitter = (Math.random() - 0.5) * 0.1; // ±0.05
    return Math.min(1, Math.max(0, parseFloat((baseScore + jitter).toFixed(3))));
  }
  