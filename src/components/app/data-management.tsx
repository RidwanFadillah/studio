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
        title: 'No Data to Export',
        description: 'Add some transactions before exporting.',
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
      title: 'Data Exported!',
      description: 'Your transactions have been downloaded as a CSV file.',
    });
  };

  const handleClear = () => {
    onClearData();
    toast({
      title: 'Data Cleared',
      description: 'All your transaction data has been removed.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Data (CSV)
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your transaction data from this
                browser.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
