/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { QRScanner } from '../components/QRScanner.tsx';
import {
  QrCode,
  ShieldCheck,
  Car,
  Bike,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface PetugasScanProps {
  user: any;
}

export const PetugasScan: React.FC<PetugasScanProps> = ({ user }) => {
  const [spots, setSpots] = useState<any[]>([]);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number>(1);
  const [checkinLogs, setCheckinLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAttendantData();
  }, [user]);

  const loadAttendantData = async () => {
    try {
      const [spotsRes, logsRes] = await Promise.all([api.getSpots(), api.getCheckinLogs()]);
      if (spotsRes.success) setSpots(spotsRes.data);
      if (logsRes.success) setCheckinLogs(logsRes.data);
    } catch (err) {
      console.warn('Error loading attendant data:', err);
    }
  };

  const handleScanSuccess = async (scannedCode: string) => {
    setLoading(true);
    setScanMessage(null);
    setCheckinSuccess(null);
    setVerifiedData(null);
    setSelectedVehicleId(null);

    try {
      const res = await api.verifyQR(scannedCode);
      if (res.success && res.data) {
        setVerifiedData(res.data);
        setScanMessage({
          type: 'success',
          text: `QR Valid! Pengendara: ${res.data.user.full_name} (${res.data.subscription.package_name})`,
        });

        if (res.data.vehicles && res.data.vehicles.length > 0) {
          setSelectedVehicleId(res.data.vehicles[0].vehicle_id);
        }
      }
    } catch (err: any) {
      setScanMessage({
        type: 'error',
        text: err.message || 'Kode QR tidak valid atau kedaluwarsa.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedData || !selectedVehicleId || !selectedSpotId) {
      return;
    }

    setCheckinLoading(true);
    setCheckinSuccess(null);

    try {
      const res = await api.checkin({
        subscription_id: verifiedData.subscription.id,
        vehicle_id: selectedVehicleId,
        spot_id: selectedSpotId,
      });

      if (res.success) {
        setCheckinSuccess(res.message);
        setVerifiedData(null);
        setSelectedVehicleId(null);
        await loadAttendantData();
        setTimeout(() => setCheckinSuccess(null), 5000);
      }
    } catch (err: any) {
      setScanMessage({
        type: 'error',
        text: err.message || 'Gagal menyimpan check-in kendaraan.',
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Menu Khusus Juru Parkir
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Pemindai & Validasi Check-In Parkir
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pindai QR langganan pengendara untuk memverifikasi keabsahan dan mencatat kendaraan masuk
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="font-semibold text-slate-800">Petugas: {user?.full_name}</span>
            <span className="text-slate-400 block text-[10px]">Dishub Kota Pangkalpinang</span>
          </div>
        </div>
      </div>

      {checkinSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">{checkinSuccess}</div>
        </div>
      )}

      {scanMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            scanMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {scanMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{scanMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <QRScanner onScanSuccess={handleScanSuccess} isLoading={loading} />
        </div>

        <div className="space-y-4">
          {verifiedData ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Langganan Terverifikasi</h3>
                    <p className="text-[11px] text-emerald-700 font-semibold">Status: LUNAS & AKTIF</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: #{verifiedData.subscription.id}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama Pengendara:</span>
                  <span className="font-bold text-slate-900">{verifiedData.user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Telepon:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {verifiedData.user.phone_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paket Langganan:</span>
                  <span className="font-semibold text-blue-700">
                    {verifiedData.subscription.package_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Masa Berlaku Hingga:</span>
                  <span className="font-mono text-emerald-800 font-bold">
                    {formatDate(verifiedData.subscription.end_date)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmCheckin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    1. Pilih Kendaraan yang Sedang Masuk Parkir:
                  </label>
                  {verifiedData.vehicles && verifiedData.vehicles.length > 0 ? (
                    <div className="space-y-2">
                      {verifiedData.vehicles.map((v: any) => (
                        <label
                          key={v.vehicle_id}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            selectedVehicleId === v.vehicle_id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="vehicle_id"
                              value={v.vehicle_id}
                              checked={selectedVehicleId === v.vehicle_id}
                              onChange={() => setSelectedVehicleId(v.vehicle_id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div className="text-xs font-bold font-mono tracking-wider">
                                {v.license_plate}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {v.brand} · {v.color} ({v.vehicle_type})
                              </div>
                            </div>
                          </div>
                          {v.vehicle_type === 'CAR' ? (
                            <Car className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Bike className="w-4 h-4 text-slate-500" />
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      Pengendara belum mendaftarkan plat nomor kendaraan di akun mereka.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    2. Pilih Titik Lokasi Parkir:
                  </label>
                  <select
                    value={selectedSpotId}
                    onChange={(e) => setSelectedSpotId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {spots.map((spot) => (
                      <option key={spot.spot_id} value={spot.spot_id}>
                        [{spot.spot_name}] {spot.display_title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={checkinLoading || !selectedVehicleId}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {checkinLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mencatat Check-In...</span>
                      </>
                    ) : (
                      <>
                        <span>Konfirmasi Check-In Parkir</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Menunggu Hasil Pindai QR</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Arahkan kamera ke QR Code pengendara atau gunakan tombol simulasi cepat di sebelah
                kiri. Formulir pemilihan kendaraan dan titik parkir akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Log Check-In Parkir Hari Ini</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total Dicatat: {checkinLogs.length} Kendaraan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Plat Nomor</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Pengendara</th>
                <th className="py-3 px-4">Titik Parkir</th>
                <th className="py-3 px-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {checkinLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    Belum ada kendaraan yang divalidasi hari ini.
                  </td>
                </tr>
              ) : (
                checkinLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600">{formatTime(log.scanned_at)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.license_plate}</td>
                    <td className="py-3 px-4">
                      <span className="font-sans px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.vehicle_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800">{log.driver_name}</td>
                    <td className="py-3 px-4 font-sans text-slate-800">
                      <span className="font-mono font-bold text-blue-700 mr-1.5">
                        {log.spot_name}
                      </span>
                      <span className="text-[11px] text-slate-500">{log.spot_title}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">{log.attendant_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
