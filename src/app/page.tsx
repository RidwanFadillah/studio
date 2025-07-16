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
        <BalanceDisplay transactions={transactions} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
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
