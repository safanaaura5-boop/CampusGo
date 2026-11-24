/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { QRGenerator } from '../components/QRGenerator.tsx';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  AlertCircle,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react';

interface LanggananProps {
  user: any;
}

export const Langganan: React.FC<LanggananProps> = ({ user }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState('QRIS Pangkalpinang Berkah');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const [pkgsRes, histRes, activeRes] = await Promise.all([
        api.getPackages(),
        api.getSubscriptions(),
        api.getActiveSubscription(),
      ]);

      if (pkgsRes.success) setPackages(pkgsRes.data);
      if (histRes.success) setHistory(histRes.data);
      if (activeRes.success) {
        setActiveSub(activeRes.hasActive ? activeRes.data : null);
      }
    } catch (err: any) {
      console.warn('Load subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.purchaseSubscription(selectedPackageId, paymentMethod);
      if (res.success) {
        setSuccessMsg(res.message);
        setIsPurchaseModalOpen(false);
        await loadSubscriptionData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses langganan.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Riwayat & Status Langganan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola paket langganan parkir resmi Anda dan tunjukkan QR Code aktif kepada petugas
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsPurchaseModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Mulai Langganan / Perpanjang Langganan</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Status Langganan Saat Ini</h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem Parkir Terpadu Kota Pangkalpinang
                  </p>
                </div>
              </div>

              {activeSub ? (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Langganan Aktif
                </span>
              ) : (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  Tidak Ada Langganan Aktif
                </span>
              )}
            </div>

            {activeSub ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                      Paket Aktif
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeSub.package_name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      Masa aktif: {formatDate(activeSub.start_date)} — {formatDate(activeSub.end_date)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-medium text-slate-500">Tarif Retribusi:</span>
                    <div className="text-base font-bold text-slate-900 font-mono">
                      {formatCurrency(activeSub.price)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Lunas via {activeSub.payment_method || 'QRIS'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Registrasi Langganan:</span>
                    <span className="font-mono font-semibold text-slate-800">#{activeSub.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kode Unik QR:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[220px]">
                      {activeSub.qr_code}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Belum Ada Paket Langganan</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                    Aktifkan paket parkir harian, bulanan, atau tahunan untuk menikmati fasilitas
                    parkir tanpa biaya tunai berulang di seluruh Kota Pangkalpinang.
                  </p>
                </div>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Pilih Paket Langganan
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Pilihan Paket Retribusi Resmi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {packages.map((pkg) => (
                <div
                  key={pkg.package_id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2 hover:border-blue-400 transition-colors"
                >
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      {pkg.duration_days} Hari
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{pkg.package_name}</h4>
                    <p className="text-base font-bold font-mono text-slate-900 mt-1">
                      {formatCurrency(pkg.price)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                      {pkg.description || 'Akses parkir resmi seluruh Pangkalpinang.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPackageId(pkg.package_id);
                      setIsPurchaseModalOpen(true);
                    }}
                    className="w-full mt-2 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-lg transition-colors text-slate-700"
                  >
                    Pilih Paket
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {activeSub ? (
            <QRGenerator
              subscription={activeSub}
              userName={user?.full_name || 'Pengendara'}
              userPhone={user?.phone_number || ''}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">QR Code Siap Pakai</h4>
              <p className="text-xs text-slate-500">
                Setelah Anda mengaktifkan langganan, QR Code unik bertanda tangan digital akan
                ditampilkan di sini secara otomatis.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Catatan Riwayat Langganan</h3>
            <p className="text-[11px] text-slate-500">
              Daftar transaksi paket langganan parkir yang pernah Anda beli
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Total: {history.length} Catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Paket Langganan</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Tanggal Mulai</th>
                <th className="py-3 px-4">Tanggal Berakhir</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Metode Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat langganan tercatat.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">#{row.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.package_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatDate(row.start_date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatDate(row.end_date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          row.payment_status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.payment_status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.payment_status === 'PAID' ? 'LUNAS (AKTIF)' : row.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.payment_method || 'QRIS'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Beli / Perpanjang Langganan Parkir
                </h3>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Paket Durasi
                </label>
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <label
                      key={pkg.package_id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedPackageId === pkg.package_id
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="package_id"
                          value={pkg.package_id}
                          checked={selectedPackageId === pkg.package_id}
                          onChange={() => setSelectedPackageId(pkg.package_id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{pkg.package_name}</div>
                          <div className="text-[11px] text-slate-500">
                            Durasi aktif: {pkg.duration_days} Hari
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran Retribusi
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="QRIS Pangkalpinang Berkah">
                    QRIS Pangkalpinang Berkah (Instan)
                  </option>
                  <option value="Bank Sumsel Babel Virtual Account">
                    Bank Sumsel Babel Virtual Account
                  </option>
                  <option value="Dompet Digital (GoPay / OVO / Dana)">
                    Dompet Digital (GoPay / OVO / Dana)
                  </option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Nama Pemohon:</span>
                  <span className="font-semibold text-slate-800">{user?.full_name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Penerbit:</span>
                  <span className="font-semibold text-slate-800">Dishub Kota Pangkalpinang</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Bayar & Aktifkan Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
