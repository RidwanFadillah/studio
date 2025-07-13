'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { Download, Trash2 } from 'lucide-react';

interface DataManagementProps {
  transactions: Transaction[];
  onClearData: () => void;
}

export default function DataManagement({ transactions, onClearData }: DataManagementProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (transactions.length === 0) {
      toast({
        title: 'Tidak Ada Data untuk Diekspor',
        description: 'Tambahkan beberapa transaksi sebelum mengekspor.',
        variant: 'destructive',
      });
      return;
    }

    const header = 'id,type,description,amount,category,date\n';
    const csv = transactions
      .map(t => {
        const category = t.type === 'spending' ? t.category : '';
        return `${t.id},${t.type},"${t.description}",${t.amount},${category},${t.date}`;
      })
      .join('\n');

    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pocketbalance_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Data Diekspor!',
      description: 'Transaksi Anda telah diunduh sebagai file CSV.',
    });
  };

  const handleClear = () => {
    onClearData();
    toast({
      title: 'Data Dihapus',
      description: 'Semua data transaksi Anda telah dihapus.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Unduh Data (CSV)
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Semua Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen semua data transaksi Anda dari
                browser ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>Lanjutkan</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
