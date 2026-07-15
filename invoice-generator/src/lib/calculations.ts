export type DiscountType = 'percentage' | 'fixed';

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  unit: string;
  hsnCode?: string;
  taxRate?: number;
  taxable?: boolean;
}

export interface CalculationInput {
  lineItems: LineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate1: number;
  taxRate2: number;
  exchangeRate?: number;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount1: number;
  taxAmount2: number;
  totalItemTax: number;
  totalTax: number;
  total: number;
  totalConverted?: number;
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateInvoice(input: CalculationInput): CalculationResult {
  let subtotal = 0;
  for (const item of input.lineItems) {
    const itemTotal = roundCurrency(item.quantity * item.rate);
    subtotal += itemTotal;
  }
  subtotal = roundCurrency(subtotal);

  let discountAmount = 0;
  if (input.discountValue > 0) {
    if (input.discountType === 'percentage') {
      discountAmount = subtotal * (input.discountValue / 100);
    } else {
      discountAmount = input.discountValue;
    }
  }
  discountAmount = roundCurrency(discountAmount);

  const subtotalAfterDiscount = Math.max(0, roundCurrency(subtotal - discountAmount));

  let totalItemTax = 0;
  const discountRatio = subtotal > 0 ? (discountAmount / subtotal) : 0;

  for (const item of input.lineItems) {
    const itemTotal = item.quantity * item.rate;
    const effectiveItemTotal = itemTotal * (1 - discountRatio);
    if (item.taxRate && item.taxRate > 0) {
      totalItemTax += effectiveItemTotal * (item.taxRate / 100);
    }
  }
  totalItemTax = roundCurrency(totalItemTax);

  // Both global taxes calculated against the post-discount subtotal independently
  let taxAmount1 = 0;
  if (input.taxRate1 > 0) {
    taxAmount1 = subtotalAfterDiscount * (input.taxRate1 / 100);
  }
  taxAmount1 = roundCurrency(taxAmount1);

  let taxAmount2 = 0;
  if (input.taxRate2 > 0) {
    taxAmount2 = subtotalAfterDiscount * (input.taxRate2 / 100);
  }
  taxAmount2 = roundCurrency(taxAmount2);

  const totalTax = roundCurrency(taxAmount2 + totalItemTax);

  const total = roundCurrency(subtotalAfterDiscount + totalTax - taxAmount1);

  const result: CalculationResult = {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount1,
    taxAmount2,
    totalItemTax,
    totalTax,
    total,
  };

  if (input.exchangeRate && input.exchangeRate !== 1) {
    result.totalConverted = roundCurrency(total * input.exchangeRate);
  }

  return result;
}
