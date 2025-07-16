// src/components/app/receipt-scanner.tsx
'use client';

import { useState, useRef, useTransition, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { scanReceiptAction } from '@/app/actions';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt';

interface ReceiptScannerProps {
  onScanSuccess: (data: ScanReceiptOutput) => void;
}

export default function ReceiptScanner({ onScanSuccess }: ReceiptScannerProps) {
  const [isScanning, startScanningTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanReceipt = () => {
    if (!preview) {
      toast({
        title: 'Tidak ada gambar dipilih',
        description: 'Silakan pilih gambar struk untuk dipindai.',
        variant: 'destructive',
      });
      return;
    }

    startScanningTransition(async () => {
      try {
        const result = await scanReceiptAction({ receiptImage: preview });
        toast({
          title: 'Struk Berhasil Dipindai!',
          description: 'Informasi transaksi telah diisi ke formulir pengeluaran.',
        });
        onScanSuccess(result);
      } catch (error) {
        console.error('Error scanning receipt:', error);
        toast({
          title: 'Gagal Memindai Struk',
          description: 'Terjadi kesalahan. Coba lagi dengan gambar yang lebih jelas.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Card
        className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-accent/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          {preview ? (
            <Image src={preview} alt="Pratinjau Struk" width={200} height={200} className="max-h-full max-w-full rounded-md object-contain" />
          ) : (
            <>
              <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Klik untuk mengunggah struk</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, atau WEBP</p>
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleScanReceipt} disabled={!preview || isScanning} className="w-full">
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memindai...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Pindai Struk & Isi Formulir
          </>
        )}
      </Button>
    </div>
  );
}
