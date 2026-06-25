export interface GstSplit {
  cgstAmount: number
  sgstAmount: number
  cgstRate: number
  sgstRate: number
}

/**
 * Derive the 50/50 CGST/SGST split from a bill's stored subtotal and tax amount.
 * Display-only: the bill still persists a single combined tax_amount.
 */
export function gstSplit(subtotal: number, taxAmount: number): GstSplit {
  const gstRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0
  const half = taxAmount / 2
  return {
    cgstAmount: half,
    sgstAmount: half,
    cgstRate: gstRate / 2,
    sgstRate: gstRate / 2,
  }
}

/** Format a percentage rate without trailing zeros, e.g. 9, 2.5, 9.01. */
export function formatRate(rate: number): string {
  return parseFloat(rate.toFixed(2)).toString()
}
