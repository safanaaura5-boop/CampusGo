/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import {
  Car,
  Receipt,
  QrCode,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [activeSub, setActiveSub] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDriver = user?.role === 'DRIVER';
  const isAttendant = user?.role === 'ATTENDANT';

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [spotsRes, subRes] = await Promise.all([
        api.getSpots(),
        isDriver ? api.getActiveSubscription() : Promise.resolve({ hasActive: false, data: null }),
      ]);

      if (spotsRes.success) setSpots(spotsRes.data);
      if (subRes.success && subRes.hasActive) setActiveSub(subRes.data);

      if (isDriver) {
        const vRes = await api.getVehicles();
        if (vRes.success) setVehicles(vRes.data);
      }

      if (isAttendant) {
        const logsRes = await api.getCheckinLogs();
        if (logsRes.success) setRecentLogs(logsRes.data);
      }
    } catch (err) {
      console.warn('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-500/40 text-[11px] font-semibold text-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Parkir Berlangganan Kota Pangkalpinang</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat Datang, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed">
            {isDriver
              ? 'Kelola data kendaraan Anda, perpanjang langganan parkir tanpa uang tunai, dan pantau lokasi titik parkir resmi di seluruh penjuru kota.'
              : 'Gunakan pemindai kamera untuk memverifikasi QR Code pengendara dan catat check-in parkir secara akurat dan transparan.'}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-5">
            {isDriver && (
              <>
                <button
                  onClick={() => setActiveTab('langganan')}
                  className="px-4 py-2 bg-white text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-50 shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{activeSub ? 'Lihat QR Langganan' : 'Mulai Langganan Baru'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('kendaraan')}
                  className="px-4 py-2 bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Daftar Kendaraan</span>
                </button>
              </>
            )}

            {isAttendant && (
              <button
                onClick={() => setActiveTab('petugas-scan')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                <span>Buka Pemindai QR Sekarang</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('peta')}
              className="px-4 py-2 bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pantau Peta Lokasi</span>
            </button>
          </div>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <Car className="w-48 h-48" />
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDriver && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Status Langganan</span>
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2">
                  {activeSub ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-base font-bold text-slate-900">Aktif</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-base font-bold text-slate-900">Belum Langganan</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {activeSub ? activeSub.package_name : 'Beli paket untuk parkir gratis'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('langganan')}
                className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>{activeSub ? 'Tampilkan QR' : 'Aktifkan'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Kendaraan Terdaftar</span>
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {vehicles.length}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mobil & Sepeda Motor</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('kendaraan')}
                className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Kelola Kendaraan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </>
        )}

        {isAttendant && (
          <>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Titik Tugas Aktif</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <div className="text-base font-bold text-slate-900">ATM-01 & RMN-01</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Alun-Alun Merdeka & Ramayana Mall
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('petugas-scan')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Mulai Scan Lapangan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Total Check-in Tercatat</span>
                  <QrCode className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {recentLogs.length}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kendaraan divalidasi</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('petugas-scan')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Lihat Log Riwayat</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Titik Lokasi Parkir</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {spots.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Tersebar di Kota Pangkalpinang</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('peta')}
            className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Buka Peta Digital</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Sistem Terintegrasi</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="text-base font-bold text-slate-900">Dishub Babel</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bebas Uang Tunai & Tanpa Pungli
              </p>
            </div>
          </div>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <span>● Pelayanan Aktif</span>
          </div>
        </div>
      </div>

      {/* Featured Pangkalpinang Parking Spots Grid (without capacity and without status) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Titik Parkir Resmi Pangkalpinang</h3>
            <p className="text-xs text-slate-500">
              Lokasi strategis pusat kegiatan masyarakat, pasar, mall, dan perkantoran
            </p>
          </div>
          <button
            onClick={() => setActiveTab('peta')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Lihat Semua ({spots.length} Titik)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {spots.slice(0, 6).map((spot) => (
            <div
              key={spot.spot_id}
              onClick={() => setActiveTab('peta')}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded">
                  {spot.spot_name}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  ID #{spot.spot_id}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {spot.display_title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{spot.address}</p>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono flex items-center justify-between">
                <span>GPS:</span>
                <span>{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
