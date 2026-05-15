/**
 * Safely convert amount to number and format it
 * Handles: numbers, strings, null, undefined, NaN
 */
export function safeAmount(amount: any): number {
  if (amount === null || amount === undefined) {
    console.warn('[safeAmount] Amount is null/undefined, returning 0');
    return 0;
  }

  if (typeof amount === 'number') {
    return isNaN(amount) ? 0 : amount;
  }

  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) {
      console.warn('[safeAmount] Failed to parse string amount:', amount, 'returning 0');
      return 0;
    }
    return parsed;
  }

  console.warn('[safeAmount] Unexpected amount type:', typeof amount, 'value:', amount);
  return 0;
}

/**
 * Format amount as currency string with 2 decimals
 */
export function formatAmount(amount: any): string {
  return safeAmount(amount).toFixed(2);
}

/**
 * Format amount with prefix for display
 */
export function formatAmountWithSign(amount: any, isIncoming: boolean): string {
  const num = safeAmount(amount);
  return `${isIncoming ? '+' : '-'}${num.toFixed(2)}`;
}
