'use client';

import BalanceDisplay from '@/components/app/balance-display';
import DataManagement from '@/components/app/data-management';
import TransactionForm from '@/components/app/transaction-form';
import TransactionList from '@/components/app/transaction-list';
import { useTransactions } from '@/hooks/use-transactions';

export default function Home() {
  const { transactions, addTransaction, clearTransactions, loading } = useTransactions();

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Atur Keuangan, Raih Tujuan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            PocketBalance membantu Anda mencatat setiap pemasukan dan pengeluaran dengan mudah.
          </p>
        </div>

        <BalanceDisplay transactions={transactions} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <TransactionForm onAddTransaction={addTransaction} />
            <TransactionList transactions={transactions} />
          </div>

          <div className="flex flex-col gap-8">
            <DataManagement transactions={transactions} onClearData={clearTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
