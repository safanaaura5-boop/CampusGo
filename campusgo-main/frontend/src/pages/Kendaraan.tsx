/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  Car,
  Bike,
  Truck,
  Bus,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Search,
  X,
  Shield,
} from 'lucide-react';

export const Kendaraan: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'BUS'>('CAR');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.getVehicles();
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat kendaraan.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.addVehicle({
        license_plate: licensePlate,
        vehicle_type: vehicleType,
        brand: brand.trim(),
        color: color.trim(),
      });

      if (res.success) {
        setSuccess('Kendaraan berhasil ditambahkan!');
        setIsModalOpen(false);
        setLicensePlate('');
        setBrand('');
        setColor('');
        loadVehicles();
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan kendaraan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      const res = await api.deleteVehicle(id);
      if (res.success) {
        setSuccess('Kendaraan berhasil dihapus.');
        setDeleteTarget(null);
        loadVehicles();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kendaraan.');
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MOTORCYCLE':
        return <Bike className="w-5 h-5 text-emerald-600" />;
      case 'TRUCK':
        return <Truck className="w-5 h-5 text-amber-600" />;
      case 'BUS':
        return <Bus className="w-5 h-5 text-indigo-600" />;
      case 'CAR':
      default:
        return <Car className="w-5 h-5 text-blue-600" />;
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'MOTORCYCLE':
        return 'Sepeda Motor';
      case 'TRUCK':
        return 'Truk / Angkutan';
      case 'BUS':
        return 'Bus / Minibus';
      case 'CAR':
      default:
        return 'Mobil Pribadi';
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.license_plate.toLowerCase().includes(search.toLowerCase()) ||
      (v.brand && v.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Kendaraan Terdaftar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola plat nomor dan jenis kendaraan yang tercakup dalam langganan parkir Anda
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kendaraan Baru</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari plat nomor atau merk kendaraan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Total: {vehicles.length} Kendaraan
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Memuat daftar kendaraan Anda...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Belum Ada Kendaraan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tambahkan plat nomor kendaraan Anda agar juru parkir dapat memverifikasi saat check-in.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold"
          >
            Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.vehicle_id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {getVehicleIcon(vehicle.vehicle_type)}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {getVehicleTypeLabel(vehicle.vehicle_type)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(vehicle)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus kendaraan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl border-2 border-slate-800 text-center shadow-xs">
                  <div className="text-lg font-bold font-mono tracking-widest">
                    {vehicle.license_plate}
                  </div>
                  <div className="text-[9px] text-slate-400 tracking-wider mt-0.5">
                    BANGKA BELITUNG
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merk / Model:</span>
                    <span className="font-semibold text-slate-800">{vehicle.brand || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warna:</span>
                    <span className="font-semibold text-slate-800">{vehicle.color || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Shield className="w-3 h-3" /> Terverifikasi Langganan
                </span>
                <span className="font-mono">ID: #{vehicle.vehicle_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Kendaraan</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Plat Kendaraan (Format: BN XXXX XX)
                </label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="Contoh: BN 1234 AA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono tracking-wider font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kendaraan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleType('CAR')}
                    className={`p-2.5 text-xs font-semibold rounded-lg border text-center flex items-center justify-center gap-1.5 transition-colors ${
                      vehicleType === 'CAR'
                        ? 'bg-blue-50 border-blue-600 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Mobil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType('MOTORCYCLE')}
                    className={`p-2.5 text-xs font-semibold rounded-lg border text-center flex items-center justify-center gap-1.5 transition-colors ${
                      vehicleType === 'MOTORCYCLE'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Sepeda Motor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merk / Model Kendaraan
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Contoh: Toyota Avanza / Honda Beat"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warna Kendaraan
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Contoh: Hitam / Putih / Silver"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kendaraan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Hapus Kendaraan?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus kendaraan plat{' '}
                <span className="font-mono font-bold text-slate-900">
                  {deleteTarget.license_plate}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteVehicle(deleteTarget.vehicle_id)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
