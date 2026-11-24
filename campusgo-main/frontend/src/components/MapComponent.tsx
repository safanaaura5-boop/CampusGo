/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation } from 'lucide-react';

export interface ParkingSpot {
  spot_id: number;
  spot_name: string;
  display_title: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  spots: ParkingSpot[];
  onSelectSpot?: (spot: ParkingSpot) => void;
  selectedSpotId?: number;
  heightClass?: string;
}

// Custom DivIcon generator with official Dishub Parking pin badge
const createOfficialPinIcon = (isSelected: boolean) => {
  const bgColor = isSelected ? 'bg-blue-800 ring-4 ring-blue-300 scale-125' : 'bg-blue-600 ring-2 ring-blue-200';

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-white font-bold text-xs shadow-md transition-transform">
      <span>P</span>
      <div class="absolute -bottom-1 w-2 h-2 rotate-45 ${isSelected ? 'bg-blue-800' : 'bg-blue-600'}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const MapComponent: React.FC<MapComponentProps> = ({
  spots,
  onSelectSpot,
  selectedSpotId,
  heightClass = 'h-[540px]',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Pangkalpinang city center coordinates
  const PANGKALPINANG_CENTER: [number, number] = [-2.1290, 106.1130];

  const filteredSpots = spots.filter((spot) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      spot.spot_name.toLowerCase().includes(q) ||
      spot.display_title.toLowerCase().includes(q) ||
      spot.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Search Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi titik parkir (cth: Alun-Alun, BTC, Ramayana)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Kota Pangkalpinang, Bangka Belitung</span>
        </div>
      </div>

      {/* Map Viewport */}
      <div className={`w-full relative ${heightClass}`}>
        <MapContainer
          center={PANGKALPINANG_CENTER}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredSpots.map((spot) => (
            <Marker
              key={spot.spot_id}
              position={[spot.latitude, spot.longitude]}
              icon={createOfficialPinIcon(spot.spot_id === selectedSpotId)}
            >
              <Popup>
                <div className="p-3 max-w-[280px] space-y-2 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {spot.spot_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID #{spot.spot_id}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {spot.display_title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
                      <span>{spot.address}</span>
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono flex justify-between">
                    <span>Koordinat:</span>
                    <span className="font-semibold text-slate-800">
                      {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                    </span>
                  </div>

                  {onSelectSpot && (
                    <button
                      onClick={() => onSelectSpot(spot)}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Pilih Titik Parkir Ini</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span className="text-[11px] font-medium">Titik Parkir Resmi Dishub Pangkalpinang</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Menampilkan {filteredSpots.length} dari {spots.length} titik lokasi
        </span>
      </div>
    </div>
  );
};
