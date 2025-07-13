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
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Please enter a positive amount.' }),
});

const spendingSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Please enter a positive amount.' }),
  category: z.enum(spendingCategories, {
    errorMap: () => ({ message: 'Please select a category.' }),
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
    defaultValues: { description: '', amount: undefined },
  });

  const spendingForm = useForm<z.infer<typeof spendingSchema>>({
    resolver: zodResolver(spendingSchema),
    defaultValues: { description: '', amount: undefined },
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
        title: 'Description needed',
        description: 'Please enter a description to suggest a category.',
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
            title: 'Category Suggested!',
            description: `We've set the category to "${result.category}".`,
          });
        } else {
          toast({
            title: 'Suggestion Failed',
            description: 'Could not suggest a valid category. Please select one manually.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'An error occurred while suggesting a category.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          <TabsContent value="spending">
            <Form {...spendingForm}>
              <form onSubmit={spendingForm.handleSubmit(onSpendingSubmit)} className="space-y-4">
                <FormField
                  control={spendingForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Coffee, Train ticket" {...field} />
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <FormLabel>Category</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
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
                          aria-label="Suggest Category"
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
                  Add Spending
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Salary, Freelance project" {...field} />
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={incomeForm.formState.isSubmitting}>
                   {incomeForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Income
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
