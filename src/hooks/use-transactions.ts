'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/lib/types';

const STORAGE_KEY = 'pocketbalance-transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(STORAGE_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Failed to load transactions from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error('Failed to save transactions to localStorage', error);
      }
    }
  }, [transactions, loading]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  return { transactions, addTransaction, clearTransactions, loading };
}
