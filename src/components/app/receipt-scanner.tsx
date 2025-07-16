// src/components/app/receipt-scanner.tsx
'use client';

import { useState, useRef, useTransition, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Image as ImageIcon, Camera, SwitchCamera } from 'lucide-react';
import Image from 'next/image';
import { scanReceiptAction } from '@/app/actions';
import type { ScanReceiptOutput } from '@/ai/flows/scan-receipt';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ReceiptScannerProps {
  onScanSuccess: (data: ScanReceiptOutput) => void;
}

export default function ReceiptScanner({ onScanSuccess }: ReceiptScannerProps) {
  const [isScanning, startScanningTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Stop any existing stream before starting a new one
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    const getCameraPermission = async () => {
      if (isCameraOpen) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacingMode } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsCameraOpen(false);
          toast({
            variant: 'destructive',
            title: 'Akses Kamera Ditolak',
            description: `Tidak bisa mengakses kamera mode "${cameraFacingMode}". Coba mode lain atau izinkan di pengaturan browser.`,
          });
        }
      }
    };
    getCameraPermission();

    return () => {
      // Cleanup function to stop camera stream on component unmount or when camera closes
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraOpen, cameraFacingMode, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsCameraOpen(false);
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
        setPreview(null);
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

  const handleToggleCamera = () => {
    if (isCameraOpen) {
      setIsCameraOpen(false);
    } else {
      setPreview(null);
      setIsCameraOpen(true);
    }
  };
  
  const handleSwitchCamera = () => {
    setCameraFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreview(dataUrl);
      setIsCameraOpen(false);
    }
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
      <canvas ref={canvasRef} className="hidden" />

      <Card className="flex aspect-video w-full flex-col items-center justify-center overflow-hidden border-2 border-dashed bg-muted/50">
        <CardContent className={cn("flex h-full w-full flex-col items-center justify-center p-0 text-center", preview && 'relative')}>
          {isCameraOpen ? (
             <div className="relative h-full w-full">
               <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                        <Alert variant="destructive">
                            <AlertTitle>Akses Kamera Diperlukan</AlertTitle>
                            <AlertDescription>
                                Mohon izinkan akses kamera untuk menggunakan fitur ini.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
             </div>
          ) : preview ? (
            <Image src={preview} alt="Pratinjau Struk" layout="fill" className="object-contain" />
          ) : (
            <div className="flex cursor-pointer flex-col items-center justify-center p-6" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Klik untuk mengunggah struk</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, atau WEBP</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-2">
        {isCameraOpen ? (
          <>
            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
              <Camera className="mr-2" /> Ambil Gambar
            </Button>
            <Button onClick={handleSwitchCamera} variant="outline" disabled={!hasCameraPermission}>
              <SwitchCamera className="mr-2" /> Ganti Kamera
            </Button>
          </>
        ) : (
          <Button onClick={handleScanReceipt} disabled={!preview || isScanning} className="col-span-2">
            {isScanning ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Upload className="mr-2" />
            )}
            Pindai Struk & Isi Formulir
          </Button>
        )}
      </div>

       <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ATAU</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button onClick={handleToggleCamera} variant="outline" className="w-full">
        {isCameraOpen ? (
          <>
            <SwitchCamera className="mr-2" /> Beralih ke Unggah File
          </>
        ) : (
          <>
            <Camera className="mr-2" /> Gunakan Kamera
          </>
        )}
      </Button>
    </div>
  );
}
