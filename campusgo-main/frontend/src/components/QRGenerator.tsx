/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, ShieldCheck, Calendar, Sparkles } from 'lucide-react';

interface QRGeneratorProps {
  subscription: {
    id: number;
    qr_code: string;
    package_name?: string;
    start_date: string;
    end_date: string;
    payment_status: string;
  };
  userName: string;
  userPhone: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  subscription,
  userName,
  userPhone,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (subscription?.qr_code) {
      navigator.clipboard.writeText(subscription.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const isExpired = new Date(subscription.end_date) <= new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>QR Pas Parkir Resmi Dishub Pangkalpinang</span>
      </div>

      <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-sm mb-4">
        <QRCodeSVG
          value={subscription.qr_code}
          size={200}
          level="H"
          includeMargin={false}
          className="rounded-lg"
        />
      </div>

      <div className="space-y-1 mb-4">
        <h4 className="text-sm font-bold text-slate-900">{userName}</h4>
        <p className="text-xs text-slate-500 font-mono">{userPhone}</p>
        <p className="text-xs font-medium text-blue-700">{subscription.package_name}</p>
      </div>

      <div
        className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between mb-4 ${
          isExpired
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-medium">Berlaku Hingga:</span>
        </div>
        <span className="font-semibold font-mono">{formatDate(subscription.end_date)}</span>
      </div>

      <div className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
        <span className="font-mono text-slate-600 truncate max-w-[200px]">
          {subscription.qr_code}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded transition-colors"
          title="Salin kode QR teks"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Tunjukkan QR ini kepada juru parkir resmi saat memarkir kendaraan Anda.
      </p>
    </div>
  );
};
