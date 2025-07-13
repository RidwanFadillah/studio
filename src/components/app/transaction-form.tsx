'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Transaction, spendingCategories, type SpendingCategory } from '@/lib/types';
import { suggestCategoryAction } from '@/app/actions';
import { useState, useTransition } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const incomeSchema = z.object({
  description: z.string().min(2, { message: 'Deskripsi minimal harus 2 karakter.' }),
  amount: z.coerce.number().positive({ message: 'Silakan masukkan jumlah yang positif.' }),
});

const spendingSchema = z.object({
  description: z.string().min(2, { message: 'Deskripsi minimal harus 2 karakter.' }),
  amount: z.coerce.number().positive({ message: 'Silakan masukkan jumlah yang positif.' }),
  category: z.enum(spendingCategories, {
    errorMap: () => ({ message: 'Silakan pilih kategori.' }),
  }),
});

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();

  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { description: '', amount: '' as any },
  });

  const spendingForm = useForm<z.infer<typeof spendingSchema>>({
    resolver: zodResolver(spendingSchema),
    defaultValues: { description: '', amount: '' as any },
  });

  function onIncomeSubmit(values: z.infer<typeof incomeSchema>) {
    onAddTransaction({ type: 'income', ...values });
    incomeForm.reset();
  }

  function onSpendingSubmit(values: z.infer<typeof spendingSchema>) {
    onAddTransaction({ type: 'spending', ...values });
    spendingForm.reset();
  }

  const handleSuggestCategory = () => {
    const description = spendingForm.getValues('description');
    if (!description) {
      toast({
        title: 'Deskripsi diperlukan',
        description: 'Silakan masukkan deskripsi untuk menyarankan kategori.',
        variant: 'destructive',
      });
      return;
    }
    startSuggestionTransition(async () => {
      try {
        const result = await suggestCategoryAction({ description });
        if (result.category && spendingCategories.includes(result.category as SpendingCategory)) {
          spendingForm.setValue('category', result.category as SpendingCategory, {
            shouldValidate: true,
          });
          toast({
            title: 'Kategori Disarankan!',
            description: `Kami telah mengatur kategori menjadi "${result.category}".`,
          });
        } else {
          toast({
            title: 'Saran Gagal',
            description: 'Tidak dapat menyarankan kategori yang valid. Silakan pilih secara manual.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Terjadi kesalahan saat menyarankan kategori.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spending">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>
          <TabsContent value="spending">
            <Form {...spendingForm}>
              <form onSubmit={spendingForm.handleSubmit(onSpendingSubmit)} className="space-y-4">
                <FormField
                  control={spendingForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input placeholder="cth: Kopi, Tiket kereta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={spendingForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={spendingForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {spendingCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSuggestCategory}
                          disabled={isSuggesting}
                          aria-label="Sarankan Kategori"
                        >
                          {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={spendingForm.formState.isSubmitting}>
                  {spendingForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tambah Pengeluaran
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="income">
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="space-y-4">
                <FormField
                  control={incomeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input placeholder="cth: Gaji, Proyek lepas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={incomeForm.formState.isSubmitting}>
                   {incomeForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tambah Pemasukan
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
