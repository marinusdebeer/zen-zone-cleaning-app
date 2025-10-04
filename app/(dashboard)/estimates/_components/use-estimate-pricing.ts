/**
 * ESTIMATE PRICING HOOK
 * 
 * Purpose:
 * Calculate pricing from line items
 * Handle tax, discounts, deposits
 */

import { useEffect } from 'react';
import { LineItem } from './estimate-line-items';

interface PricingCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  depositAmount: number;
}

export function calculatePricing(
  lineItems: LineItem[],
  taxRate: string,
  discountType: string,
  discountValue: string,
  depositRequired: boolean,
  depositType: string,
  depositValue: string
): PricingCalculations {
  // Calculate subtotal from line items
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  
  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = subtotal * (parseFloat(discountValue || '0') / 100);
  } else if (discountType === 'fixed') {
    discountAmount = parseFloat(discountValue || '0');
  }
  
  // Calculate total
  const total = subtotal + taxAmount - discountAmount;
  
  // Calculate deposit
  let depositAmount = 0;
  if (depositRequired) {
    if (depositType === 'percentage') {
      depositAmount = total * (parseFloat(depositValue || '0') / 100);
    } else {
      depositAmount = parseFloat(depositValue || '0');
    }
  }
  
  return {
    subtotal,
    taxAmount,
    discountAmount,
    total: Math.max(0, total), // Ensure non-negative
    depositAmount,
  };
}

export function useEstimatePricing(
  lineItems: LineItem[],
  taxRate: string,
  discountType: string,
  discountValue: string,
  depositRequired: boolean,
  depositType: string,
  depositValue: string,
  onCalculationsChange: (calculations: PricingCalculations) => void
) {
  useEffect(() => {
    const calculations = calculatePricing(
      lineItems,
      taxRate,
      discountType,
      discountValue,
      depositRequired,
      depositType,
      depositValue
    );
    
    onCalculationsChange(calculations);
  }, [
    lineItems,
    taxRate,
    discountType,
    discountValue,
    depositRequired,
    depositType,
    depositValue,
    onCalculationsChange,
  ]);
}

