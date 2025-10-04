/**
 * PRICING CALCULATOR UTILITY
 * 
 * Purpose:
 * Calculate pricing totals from line items at runtime
 * Since costs are NOT stored in the database, they must be calculated on-demand
 * 
 * Functions:
 * - calculateLineItemsTotal: Sum of all line items
 * - calculateTax: Tax amount based on subtotal and tax rate
 * - calculateDiscount: Discount amount (percentage or fixed)
 * - calculateDeposit: Deposit amount (percentage or fixed)
 * - calculateGrandTotal: Final total with tax and discounts
 * - calculateFullPricing: Complete pricing breakdown
 */

export interface LineItem {
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PricingBreakdown {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount: number;
  total: number;
  depositRequired?: boolean;
  depositType?: string | null;
  depositValue?: number | null;
  depositAmount: number;
}

/**
 * Calculate subtotal from line items
 * Defaults quantity to 1 if null/undefined
 */
export function calculateLineItemsTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + (quantity * unitPrice);
  }, 0);
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * (taxRate / 100);
}

/**
 * Calculate discount amount
 * @param subtotal - Subtotal before discount
 * @param discountType - "percentage" or "fixed"
 * @param discountValue - Percentage (e.g., 10 for 10%) or fixed amount
 */
export function calculateDiscount(
  subtotal: number,
  discountType?: string | null,
  discountValue?: number | null
): number {
  if (!discountType || !discountValue) return 0;
  
  if (discountType === 'percentage') {
    return subtotal * (discountValue / 100);
  } else if (discountType === 'fixed') {
    return discountValue;
  }
  
  return 0;
}

/**
 * Calculate deposit amount
 * @param total - Total amount (after tax and discounts)
 * @param depositType - "percentage" or "fixed"
 * @param depositValue - Percentage (e.g., 25 for 25%) or fixed amount
 */
export function calculateDeposit(
  total: number,
  depositType?: string | null,
  depositValue?: number | null
): number {
  if (!depositType || !depositValue) return 0;
  
  if (depositType === 'percentage') {
    return total * (depositValue / 100);
  } else if (depositType === 'fixed') {
    return depositValue;
  }
  
  return 0;
}

/**
 * Calculate grand total
 */
export function calculateGrandTotal(
  subtotal: number,
  taxAmount: number,
  discountAmount: number
): number {
  return subtotal + taxAmount - discountAmount;
}

/**
 * Calculate complete pricing breakdown from line items and settings
 * This is the main function used throughout the app
 */
export function calculateFullPricing(params: {
  lineItems: LineItem[];
  taxRate?: number;
  discountType?: string | null;
  discountValue?: number | null;
  depositRequired?: boolean;
  depositType?: string | null;
  depositValue?: number | null;
}): PricingBreakdown {
  const {
    lineItems,
    taxRate = 13,
    discountType = null,
    discountValue = null,
    depositRequired = false,
    depositType = null,
    depositValue = null,
  } = params;

  const subtotal = calculateLineItemsTotal(lineItems);
  const discountAmount = calculateDiscount(subtotal, discountType, discountValue);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = calculateTax(subtotalAfterDiscount, taxRate);
  const total = calculateGrandTotal(subtotal, taxAmount, discountAmount);
  const depositAmount = depositRequired ? calculateDeposit(total, depositType, depositValue) : 0;

  return {
    subtotal,
    taxRate,
    taxAmount,
    discountType,
    discountValue,
    discountAmount,
    total,
    depositRequired,
    depositType,
    depositValue,
    depositAmount,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

