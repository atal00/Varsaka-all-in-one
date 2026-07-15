import { calculateInvoice } from './src/lib/calculations';

function assertEqual(actual: number, expected: number, message: string) {
  if (Math.abs(actual - expected) > 0.001) {
    throw new Error(`Test failed: ${message} - expected ${expected}, got ${actual}`);
  }
}

try {
  // Test 1: Simple calculation
  let res = calculateInvoice({
    lineItems: [
      { id: '1', name: 'Item 1', quantity: 2, rate: 100, unit: 'hrs' },
    ],
    discountType: 'percentage',
    discountValue: 0,
    taxRate1: 0,
    taxRate2: 0
  });
  assertEqual(res.subtotal, 200, 'T1 Subtotal');
  assertEqual(res.total, 200, 'T1 Total');

  // Test 2: Dual taxes with discount
  res = calculateInvoice({
    lineItems: [
      { id: '1', name: 'Item 1', quantity: 1, rate: 1000, unit: 'project' }, // 1000
    ],
    discountType: 'fixed',
    discountValue: 100, // Subtotal after discount = 900
    taxRate1: 5,  // 5% of 900 = 45
    taxRate2: 10, // 10% of 900 = 90
  });
  assertEqual(res.subtotal, 1000, 'T2 Subtotal');
  assertEqual(res.discountAmount, 100, 'T2 Discount');
  assertEqual(res.subtotalAfterDiscount, 900, 'T2 SubtotalAfterDiscount');
  assertEqual(res.taxAmount1, 45, 'T2 Tax 1');
  assertEqual(res.taxAmount2, 90, 'T2 Tax 2');
  assertEqual(res.totalTax, 135, 'T2 Total Tax');
  assertEqual(res.total, 1035, 'T2 Total');

  console.log("All calculation tests passed successfully!");
} catch (e) {
  console.error(e);
  process.exit(1);
}
