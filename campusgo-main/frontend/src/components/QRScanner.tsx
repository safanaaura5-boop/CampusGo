/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  Sparkles,
  Send,
  AlertCircle,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isLoading?: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, isLoading = false }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileScanning, setFileScanning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerContainerId = 'eparking-qr-reader';

  const startCamera = async () => {
    setCameraError(null);
    try {
      // 1. Explicitly prompt user for camera permission via standard MediaDevices API first
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          // Immediately stop test stream tracks so Html5Qrcode can bind to the device
          testStream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          if (
            permErr.name === 'NotAllowedError' ||
            permErr.name === 'PermissionDeniedError' ||
            permErr.message?.toLowerCase().includes('permission denied')
          ) {
            setShowHelp(true);
            throw new Error(
              'Izin kamera diblokir oleh browser (Permission denied). Silakan klik ikon gembok / izin situs di bilah alamat browser Anda dan ubah izin Kamera menjadi "Izinkan" (Allow), lalu coba lagi.'
            );
          }
        }
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      const scanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const handleScan = (decodedText: string) => {
        stopCamera();
        onScanSuccess(decodedText);
      };

      // Try environment (back) camera first
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          scanConfig,
          handleScan,
          () => {}
        );
      } catch (backCamErr) {
        console.warn('Environment camera unavailable, falling back to default/front camera:', backCamErr);
        // Fallback to front camera or any available camera
        await scannerRef.current.start(
          { facingMode: 'user' },
          scanConfig,
          handleScan,
          () => {}
        );
      }

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera scan start failed:', err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.message?.toLowerCase().includes('permission denied') ||
        err?.message?.toLowerCase().includes('notallowederror');

      if (isDenied) {
        setShowHelp(true);
      }

      setCameraError(
        err?.message ||
          'Gagal mengakses kamera perangkat. Pastikan izin kamera aktif di browser atau gunakan pemindaian file gambar dan tombol simulasi di bawah.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  const triggerSimulation = (code: string) => {
    setManualCode(code);
    onScanSuccess(code);
  };

  // Image file scanning fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanning(true);
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err: any) {
      setCameraError('Tidak ditemukan kode QR yang valid pada file gambar yang diunggah.');
    } finally {
      setFileScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pemindai QR Langganan</h3>
            <p className="text-[11px] text-slate-500">Pindai QR pengendara menggunakan kamera</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || fileScanning}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200"
            title="Unggah foto/tangkapan layar QR code"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Pindai Foto QR</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={isScanning ? stopCamera : startCamera}
            disabled={isLoading || fileScanning}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              isScanning
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
            }`}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-3.5 h-3.5" />
                <span>Hentikan Kamera</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Buka Kamera</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera Viewport Container */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 min-h-[260px] flex items-center justify-center">
        <div id={scannerContainerId} className="w-full" />

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-3 bg-slate-950/80">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Kamera Belum Aktif</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Klik tombol <span className="font-semibold text-white">"Buka Kamera"</span> untuk
                pemindaian langsung, atau gunakan tombol simulasi cepat / unggah foto di bawah.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Aktifkan Kamera Sekarang</span>
            </button>
          </div>
        )}

        {isScanning && (
          <div className="absolute top-2 left-2 z-20 bg-slate-950/70 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            PEMINDAIAN AKTIF
          </div>
        )}
      </div>

      {/* Permission Denied / Error Notification with Step-by-Step Fix */}
      {cameraError && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Kendala Izin Akses Kamera</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{cameraError}</p>
            </div>
          </div>

          {showHelp && (
            <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-700" />
                Cara Mengaktifkan Izin Kamera di Browser:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-800 pl-1">
                <li>Klik ikon gembok / slider izin di sebelah kiri alamat URL browser (address bar).</li>
                <li>Ubah izin <strong>Kamera (Camera)</strong> dari "Blokir" menjadi <strong>"Izinkan" (Allow)</strong>.</li>
                <li>Setelah diizinkan, klik tombol <strong>"Coba Buka Kamera Lagi"</strong> di bawah.</li>
              </ol>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-[11px] transition-colors"
                >
                  Coba Buka Kamera Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instant Simulation Action Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Simulasi Scan Cepat (Untuk Pengujian Instan)</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Uji langsung verifikasi QR pengendara tanpa perlu mengarahkan kamera ke layar fisik:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => triggerSimulation('EPARKING-PKP-SUB1-USER1-2026')}
            disabled={isLoading}
            className="px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>✨ Simulasi Scan: Budi Santoso (Aktif)</span>
          </button>

          <button
            type="button"
            onClick={() => triggerSimulation('EPARKING-PKP-INVALID-9999')}
            disabled={isLoading}
            className="px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>❌ Simulasi: QR Tidak Terdaftar</span>
          </button>
        </div>
      </div>

      {/* Fallback Manual Code Input */}
      <form onSubmit={handleManualSubmit} className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Atau Masukkan Kode QR Manual:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Contoh: EPARKING-PKP-SUB1-USER1-2026"
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !manualCode.trim()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Verifikasi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
