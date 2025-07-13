// src/ai/flows/categorize-spending.ts
'use server';

/**
 * @fileOverview A flow for automatically categorizing spending transactions based on their description.
 *
 * - categorizeSpending - A function that suggests a spending category based on the transaction description.
 * - CategorizeSpendingInput - The input type for the categorizeSpending function.
 * - CategorizeSpendingOutput - The return type for the categorizeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeSpendingInputSchema = z.object({
  description: z.string().describe('The description of the spending transaction.'),
});
export type CategorizeSpendingInput = z.infer<typeof CategorizeSpendingInputSchema>;

const CategorizeSpendingOutputSchema = z.object({
  category: z.string().describe('The suggested category for the spending transaction (e.g., Food, Transport, Bills).'),
});
export type CategorizeSpendingOutput = z.infer<typeof CategorizeSpendingOutputSchema>;

export async function categorizeSpending(input: CategorizeSpendingInput): Promise<CategorizeSpendingOutput> {
  return categorizeSpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeSpendingPrompt',
  input: {schema: CategorizeSpendingInputSchema},
  output: {schema: CategorizeSpendingOutputSchema},
  prompt: `You are a personal finance assistant.  You will suggest a spending category for a given transaction description.

Transaction Description: {{{description}}}

Suggest a single category for this transaction. The category should be one of the following: Food, Transport, Bills, Entertainment, Shopping, Travel, Other.

Respond with ONLY the name of the category.
`,
});

const categorizeSpendingFlow = ai.defineFlow(
  {
    name: 'categorizeSpendingFlow',
    inputSchema: CategorizeSpendingInputSchema,
    outputSchema: CategorizeSpendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
