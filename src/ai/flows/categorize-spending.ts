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
import { spendingCategories } from '@/lib/types';

const CategorizeSpendingInputSchema = z.object({
  description: z.string().describe('The description of the spending transaction.'),
});
export type CategorizeSpendingInput = z.infer<typeof CategorizeSpendingInputSchema>;

const CategorizeSpendingOutputSchema = z.object({
  category: z.string().describe('The suggested category for the spending transaction (e.g., Makanan, Transportasi, Tagihan).'),
});
export type CategorizeSpendingOutput = z.infer<typeof CategorizeSpendingOutputSchema>;

export async function categorizeSpending(input: CategorizeSpendingInput): Promise<CategorizeSpendingOutput> {
  return categorizeSpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeSpendingPrompt',
  input: {schema: CategorizeSpendingInputSchema},
  output: {schema: CategorizeSpendingOutputSchema},
  prompt: `Anda adalah asisten keuangan pribadi. Anda akan menyarankan kategori pengeluaran untuk deskripsi transaksi yang diberikan.

Deskripsi Transaksi: {{{description}}}

Sarankan satu kategori untuk transaksi ini. Kategori harus salah satu dari berikut: ${spendingCategories.join(', ')}.

Balas HANYA dengan nama kategori.
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
