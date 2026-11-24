/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api, setToken, setStoredUser } from '../services/api.js';
import { Car, Lock, Phone, ArrowRight, ShieldCheck, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  onGoToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    api
      .getDemoAccounts()
      .then((res) => {
        if (res.success) setDemoAccounts(res.accounts);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({
        phone_number: phoneNumber,
        password: password,
      });

      if (res.success && res.token) {
        setToken(res.token);
        setStoredUser(res.user);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Gagal masuk akun.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: any) => {
    setPhoneNumber(account.phone);
    setPassword(account.pin);
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({
        phone_number: account.phone,
        password: account.pin,
      });

      if (res.success && res.token) {
        setToken(res.token);
        setStoredUser(res.user);
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Gagal masuk.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-md">
            <Car className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          E-Parking Pangkalpinang
        </h2>
        <p className="mt-1 text-center text-xs text-slate-600 font-medium">
          Sistem Langganan & Lokasi Parkir Digital Kota Pangkalpinang
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp atau Nama Lengkap
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nomor telepon atau nama sesuai akun"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi / PIN Akun
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {demoAccounts.length > 0 && (
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Akses Demo Cepat (1-Klik Masuk)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Gunakan akun demo yang tersedia pada database untuk menguji fitur peran:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                      acc.role === 'ATTENDANT'
                        ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
                        : 'bg-blue-50 hover:bg-blue-100/70 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          acc.role === 'ATTENDANT'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {acc.role === 'ATTENDANT' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{acc.name}</div>
                        <div className="text-[10px] text-slate-500">{acc.role_label}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Klik Masuk →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Belum memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                className="font-bold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Daftar Akun Baru
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
