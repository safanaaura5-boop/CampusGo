/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { MapComponent, ParkingSpot } from '../components/MapComponent.tsx';
import {
  MapPin,
  Navigation,
  Layers,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const MapView: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    setLoading(true);
    try {
      const res = await api.getSpots();
      if (res.success) {
        setSpots(res.data);
      }
    } catch (err) {
      console.warn('Load spots error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpots = spots.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              OpenStreetMap Pangkalpinang
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Peta Titik Lokasi Parkir Kota Pangkalpinang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading
              ? 'Memuat lokasi parkir resmi Dinas Perhubungan Kota Pangkalpinang...'
              : `Sebaran ${totalSpots} titik lokasi parkir resmi Dinas Perhubungan Kota Pangkalpinang berbasis koordinat GPS`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-700 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Pusat: -2.1290°, 106.1130°</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Titik Lokasi</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {totalSpots} Titik
          </div>
          <div className="text-[10px] text-blue-700 font-medium mt-1">Titik Parkir Resmi</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Wilayah Cakupan</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">Pangkalpinang</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Seluruh Kecamatan</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Otoritas Pengelola</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">Dishub Kota</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Pemerintah Kota</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Sistem Pemetaan</div>
          <div className="text-xl font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>OpenStreetMap</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">Koordinat SRID 4326</div>
        </div>
      </div>

      {/* Main Interactive Map */}
      <MapComponent
        spots={spots}
        selectedSpotId={selectedSpot?.spot_id}
        onSelectSpot={(spot) => setSelectedSpot(spot)}
        heightClass="h-[520px]"
      />

      {/* Parking spot directory */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Direktori {totalSpots} Titik Parkir Resmi Pangkalpinang
            </h3>
            <p className="text-[11px] text-slate-500">
              Daftar lengkap kode spot, nama titik lokasi, alamat, dan koordinat GPS
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Total: {spots.length} Titik</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">Kode Spot</th>
                <th className="py-3 px-4">Nama Titik Lokasi</th>
                <th className="py-3 px-4">Alamat Lokasi</th>
                <th className="py-3 px-4">Koordinat GPS</th>
                <th className="py-3 px-4 text-center">Navigasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spots.map((spot, idx) => (
                <tr
                  key={spot.spot_id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedSpot?.spot_id === spot.spot_id ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{spot.spot_name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{spot.display_title}</td>
                  <td className="py-3 px-4 text-slate-600">{spot.address}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSpot(spot);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Lihat di Peta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
