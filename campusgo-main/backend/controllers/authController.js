import bcrypt from 'bcryptjs';
import { dbPool } from '../config/db.js';
import { generateToken } from '../middlewares/auth.js';

export const login = async (req, res) => {
  try {
    const loginIdentifier = String(req.body.phone_number || '').trim();
    const { password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon/nama lengkap dan kata sandi wajib diisi.',
      });
    }

    const [users] = await dbPool.execute(
      `SELECT user_id, nik, full_name, phone_number, password_hash, role
       FROM users WHERE phone_number = ? OR full_name = ? LIMIT 2`,
      [loginIdentifier, loginIdentifier]
    );
    const user = users.find((item) => item.phone_number === loginIdentifier)
      || (users.length === 1 ? users[0] : null);

    if (!user && users.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap digunakan beberapa akun. Silakan masuk dengan nomor telepon.',
      });
    }

    if (!user || !user.password_hash || !(await bcrypt.compare(String(password), user.password_hash))) {
      return res.status(401).json({
        success: false,
        message: 'Nomor telepon/nama lengkap atau kata sandi salah.',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Berhasil masuk ke sistem E-Parking Pangkalpinang.',
      token,
      user: {
        user_id: user.user_id,
        nik: user.nik,
        full_name: user.full_name,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses login.',
    });
  }
};

export const register = async (req, res) => {
  try {
    const { nik, full_name, phone_number, password, role } = req.body;
    const name = String(full_name || '').trim();
    const phone = String(phone_number || '').trim();
    const nationalId = nik ? String(nik).trim() : null;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap dan nomor telepon wajib diisi.',
      });
    }

    const duplicateSql = nationalId
      ? 'SELECT user_id FROM users WHERE phone_number = ? OR nik = ? LIMIT 1'
      : 'SELECT user_id FROM users WHERE phone_number = ? LIMIT 1';
    const duplicateParams = nationalId ? [phone, nationalId] : [phone];
    const [existing] = await dbPool.execute(duplicateSql, duplicateParams);

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: 'Nomor telepon atau NIK sudah terdaftar dalam sistem.',
      });
    }

    const passwordHash = await bcrypt.hash(String(password || '123456'), 10);
    const userRole = role === 'ATTENDANT' ? 'ATTENDANT' : 'DRIVER';
    const [result] = await dbPool.execute(
      'INSERT INTO users (nik, full_name, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [nationalId, name, phone, passwordHash, userRole]
    );
    const user = {
      user_id: result.insertId,
      nik: nationalId,
      full_name: name,
      phone_number: phone,
      role: userRole,
    };

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil!',
      token: generateToken(user),
      user,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Nomor telepon atau NIK sudah terdaftar dalam sistem.',
      });
    }
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal melakukan pendaftaran akun.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await dbPool.execute(
      'SELECT user_id, nik, full_name, phone_number, role FROM users WHERE user_id = ? LIMIT 1',
      [req.user.user_id]
    );
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const [subscriptions] = await dbPool.execute(
      `SELECT * FROM subscription_history
       WHERE user_id = ? AND payment_status = 'PAID' AND end_date > CURRENT_TIMESTAMP
       ORDER BY end_date DESC LIMIT 1`,
      [user.user_id]
    );
    const [vehicleCounts] = await dbPool.execute(
      'SELECT COUNT(*) AS vehicle_count FROM vehicles WHERE user_id = ?',
      [user.user_id]
    );

    return res.json({
      success: true,
      user,
      hasActiveSubscription: subscriptions.length > 0,
      activeSubscription: subscriptions[0] || null,
      vehicleCount: Number(vehicleCounts[0].vehicle_count),
    });
  } catch (err) {
    console.error('Load profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat profil pengguna.',
    });
  }
};

export const getDemoAccounts = async (_req, res) => {
  const demoCandidates = [
      {
        role: 'DRIVER',
        role_label: 'Pengendara (Driver)',
        name: 'Budi Santoso',
        phone: '081234567890',
        pin: '123456',
        description: 'Pemilik mobil BN 1234 AA dan motor BN 5678 BB dengan langganan bulanan aktif.',
      },
      {
        role: 'ATTENDANT',
        role_label: 'Petugas Juru Parkir (Attendant)',
        name: 'Randi Jukir',
        phone: '082198765432',
        pin: '123456',
        description: 'Petugas resmi penugasan titik Alun-Alun Taman Merdeka & Ramayana.',
      },
  ];

  try {
    const [users] = await dbPool.execute(
      'SELECT phone_number, password_hash FROM users WHERE phone_number IN (?, ?)',
      demoCandidates.map((account) => account.phone)
    );
    const accounts = [];

    for (const candidate of demoCandidates) {
      const user = users.find((item) => item.phone_number === candidate.phone);
      if (user?.password_hash && await bcrypt.compare(candidate.pin, user.password_hash)) {
        accounts.push(candidate);
      }
    }

    return res.json({ success: true, accounts });
  } catch (err) {
    console.error('Load demo accounts error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat akun demo.',
    });
  }
};
