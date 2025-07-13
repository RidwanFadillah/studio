'use server';

import { categorizeSpending, type CategorizeSpendingInput } from '@/ai/flows/categorize-spending';

export async function suggestCategoryAction(input: CategorizeSpendingInput) {
  try {
    const result = await categorizeSpending(input);
    return result;
  } catch (error) {
    console.error('Error in suggestCategoryAction:', error);
    throw new Error('Failed to suggest a category.');
  }
}
