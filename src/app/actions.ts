'use server';

import { categorizeSpending, type CategorizeSpendingInput } from '@/ai/flows/categorize-spending';
import { scanReceipt, type ScanReceiptInput } from '@/ai/flows/scan-receipt';

export async function suggestCategoryAction(input: CategorizeSpendingInput) {
  try {
    const result = await categorizeSpending(input);
    return result;
  } catch (error) {
    console.error('Error in suggestCategoryAction:', error);
    throw new Error('Failed to suggest a category.');
  }
}

export async function scanReceiptAction(input: ScanReceiptInput) {
  try {
    const result = await scanReceipt(input);
    return result;
  } catch (error) {
    console.error('Error in scanReceiptAction:', error);
    throw new Error('Failed to scan the receipt.');
  }
}
