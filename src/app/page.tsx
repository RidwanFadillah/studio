'use client';

import BalanceDisplay from '@/components/app/balance-display';
import DataManagement from '@/components/app/data-management';
import TransactionForm from '@/components/app/transaction-form';
import TransactionList from '@/components/app/transaction-list';
import { useTransactions } from '@/hooks/use-transactions';
import { Rocket } from 'lucide-react';

export default function Home() {
  const { transactions, addTransaction, clearTransactions, loading } = useTransactions();

  return (
    <main className="container mx-auto max-w-4xl p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-foreground">
          <Rocket className="h-10 w-10 text-accent" />
          PocketBalance
        </h1>
        <p className="text-muted-foreground">Pelacak arus kas sederhana Anda.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <BalanceDisplay transactions={transactions} />
          <TransactionList transactions={transactions} />
        </div>

        <div className="flex flex-col gap-8">
          <TransactionForm onAddTransaction={addTransaction} />
          <DataManagement transactions={transactions} onClearData={clearTransactions} />
        </div>
      </div>
    </main>
  );
}
