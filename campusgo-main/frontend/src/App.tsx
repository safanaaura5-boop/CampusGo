/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api, getToken, removeToken, getStoredUser, setStoredUser } from './services/api.js';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Kendaraan } from './pages/Kendaraan.tsx';
import { Langganan } from './pages/Langganan.tsx';
import { PetugasScan } from './pages/PetugasScan.tsx';
import { MapView } from './pages/MapView.tsx';
import { Car, RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setStoredUser(res.user);
        if (res.user.role === 'ATTENDANT') {
          setActiveTab('petugas-scan');
        }
      } else {
        removeToken();
        setUser(null);
      }
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (userData.role === 'ATTENDANT') {
      setActiveTab('petugas-scan');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white mb-4 animate-bounce">
          <Car className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
          <span>Memuat Sistem E-Parking Pangkalpinang...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return (
        <Register
          onRegisterSuccess={handleLoginSuccess}
          onGoToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard user={user} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'kendaraan' && user.role === 'DRIVER' && (
          <Kendaraan />
        )}

        {activeTab === 'langganan' && user.role === 'DRIVER' && (
          <Langganan user={user} />
        )}

        {activeTab === 'petugas-scan' && (
          <PetugasScan user={user} />
        )}

        {activeTab === 'peta' && <MapView />}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">E-Parking Pangkalpinang</span>
            <span>·</span>
            <span>Dinas Perhubungan Kota Pangkalpinang</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Sistem Langganan Retribusi Parkir Digital & Monitoring Lokasi OpenStreetMap
          </div>
        </div>
      </footer>
    </div>
  );
}
