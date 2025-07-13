'use client';

import {
  Car,
  CircleHelp,
  Plane,
  Receipt,
  ShoppingBag,
  Ticket,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SpendingCategory, Transaction } from '@/lib/types';

const categoryIcons: Record<SpendingCategory, React.ElementType> = {
  Makanan: Utensils,
  Transportasi: Car,
  Tagihan: Receipt,
  Hiburan: Ticket,
  Belanja: ShoppingBag,
  Perjalanan: Plane,
  Lainnya: CircleHelp,
};

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
    const Icon = categoryIcons[transaction.category] || CircleHelp;
    return <Icon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Jenis</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{getTransactionIcon(transaction)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.type === 'spending' && (
                        <Badge variant="outline" className="mt-1">
                          {transaction.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                      {formatDate(transaction.date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <Wallet className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold">Belum Ada Transaksi</h3>
              <p className="text-muted-foreground">Tambahkan pemasukan atau pengeluaran pertamamu untuk memulai.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
