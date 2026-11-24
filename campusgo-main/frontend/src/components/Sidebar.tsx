/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Car,
  Receipt,
  QrCode,
  MapPin,
  ShieldCheck,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onLogout,
}) => {
  const isDriver = user?.role === 'DRIVER';
  const isAttendant = user?.role === 'ATTENDANT';

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">E-Parking PKP</h2>
              <p className="text-xs text-slate-500">Kota Pangkalpinang</p>
            </div>
          </div>

          {user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {user.role === 'ATTENDANT' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{user.phone_number}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <button
              onClick={() => handleSelect('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Beranda Utama</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDriver && (
              <>
                <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu Parkir Pengendara
                </div>
                <button
                  onClick={() => handleSelect('kendaraan')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'kendaraan'
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-slate-500" />
                    <span>Kendaraan Saya</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => handleSelect('langganan')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'langganan'
                      ? 'bg-blue-50 text-blue-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-slate-500" />
                    <span>Riwayat Langganan & QR</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </>
            )}

            {isAttendant && (
              <>
                <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operasional Petugas
                </div>
                <button
                  onClick={() => handleSelect('petugas-scan')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'petugas-scan'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4" />
                    <span>Pindai QR Petugas</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Informasi Publik
            </div>
            <button
              onClick={() => handleSelect('peta')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'peta'
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Peta Titik Parkir</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
