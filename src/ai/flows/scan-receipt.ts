// src/ai/flows/scan-receipt.ts
'use server';

/**
 * @fileOverview A flow for scanning receipts using OCR to extract transaction details.
 *
 * - scanReceipt - A function that scans a receipt image and returns structured data.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScanReceiptOutput - The return type for the scanReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { spendingCategories } from '@/lib/types';

const ScanReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const ScanReceiptOutputSchema = z.object({
  description: z.string().describe('A brief summary or title of the receipt (e.g., "Grocery Shopping", "Restaurant Bill").'),
  amount: z.number().describe('The final total amount from the receipt.'),
  category: z.enum(spendingCategories).describe('The most likely spending category for this transaction.'),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: {schema: ScanReceiptInputSchema},
  output: {schema: ScanReceiptOutputSchema},
  prompt: `Anda adalah asisten keuangan yang ahli dalam membaca dan menafsirkan struk belanja.
Tugas Anda adalah menganalisis gambar struk berikut dan mengekstrak informasi penting.

Gambar Struk: {{media url=receiptImage}}

1.  **Deskripsi**: Berikan deskripsi singkat untuk transaksi ini. Ini bisa berupa nama toko atau ringkasan umum (misalnya, "Belanja Bulanan", "Makan Siang").
2.  **Jumlah**: Identifikasi jumlah total akhir pada struk. Ini harus angka final yang dibayarkan.
3.  **Kategori**: Tentukan kategori pengeluaran yang paling sesuai dari daftar berikut: ${spendingCategories.join(', ')}.

Hasilkan output dalam format JSON yang terstruktur sesuai dengan skema yang diberikan.
`,
});

const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ScanReceiptInputSchema,
    outputSchema: ScanReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
