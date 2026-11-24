import { randomUUID } from 'node:crypto';
import { dbPool } from '../config/db.js';

export const getPackages = async (_req, res) => {
  try {
    const [packages] = await dbPool.query(
      'SELECT package_id, package_name, duration_days, price, description FROM `package` ORDER BY package_id'
    );
    return res.json({ success: true, data: packages });
  } catch (err) {
    console.error('Load subscription packages error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat paket langganan.' });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const [history] = await dbPool.execute(
      `SELECT sh.id, sh.user_id, sh.package_id, sh.qr_code, sh.start_date, sh.end_date,
              sh.payment_status, sh.payment_method, p.package_name, p.duration_days, p.price
       FROM subscription_history sh
       JOIN \`package\` p ON p.package_id = sh.package_id
       WHERE sh.user_id = ?
       ORDER BY sh.start_date DESC`,
      [req.user.user_id]
    );
    return res.json({ success: true, data: history });
  } catch (err) {
    console.error('Load subscription history error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat langganan.' });
  }
};

export const getActiveSubscription = async (req, res) => {
  try {
    const [subscriptions] = await dbPool.execute(
      `SELECT sh.id, sh.user_id, sh.package_id, sh.qr_code, sh.start_date, sh.end_date,
              sh.payment_status, sh.payment_method, p.package_name, p.duration_days, p.price
       FROM subscription_history sh
       JOIN \`package\` p ON p.package_id = sh.package_id
       WHERE sh.user_id = ? AND sh.payment_status = 'PAID' AND sh.end_date > CURRENT_TIMESTAMP
       ORDER BY sh.end_date DESC
       LIMIT 1`,
      [req.user.user_id]
    );
    const activeSub = subscriptions[0];

    return res.json({
      success: true,
      hasActive: Boolean(activeSub),
      data: activeSub || null,
    });
  } catch (err) {
    console.error('Load active subscription error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memeriksa status langganan aktif.',
    });
  }
};

export const purchaseSubscription = async (req, res) => {
  try {
    const packageId = Number.parseInt(req.body.package_id, 10);
    if (!Number.isInteger(packageId) || packageId < 1) {
      return res.status(400).json({ success: false, message: 'Paket langganan harus dipilih.' });
    }

    const [packages] = await dbPool.execute(
      'SELECT package_id, package_name, duration_days, price FROM `package` WHERE package_id = ? LIMIT 1',
      [packageId]
    );
    const subscriptionPackage = packages[0];
    if (!subscriptionPackage) {
      return res.status(404).json({ success: false, message: 'Paket langganan tidak ditemukan.' });
    }

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + Number(subscriptionPackage.duration_days) * 24 * 60 * 60 * 1000
    );
    const paymentMethod = req.body.payment_method || 'QRIS Pangkalpinang Berkah';
    const qrCode = `EPARKING-PKP-${randomUUID().toUpperCase()}`;
    const [result] = await dbPool.execute(
      `INSERT INTO subscription_history
         (user_id, package_id, qr_code, start_date, end_date, payment_status, payment_method)
       VALUES (?, ?, ?, ?, ?, 'PAID', ?)`,
      [req.user.user_id, packageId, qrCode, startDate, endDate, paymentMethod]
    );

    return res.status(201).json({
      success: true,
      message: 'Langganan berhasil diaktifkan! QR Code parkir Anda siap digunakan.',
      data: {
        id: result.insertId,
        user_id: req.user.user_id,
        package_id: packageId,
        qr_code: qrCode,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_status: 'PAID',
        payment_method: paymentMethod,
        package_name: subscriptionPackage.package_name,
        duration_days: subscriptionPackage.duration_days,
        price: subscriptionPackage.price,
      },
    });
  } catch (err) {
    console.error('Purchase subscription error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memproses langganan.',
    });
  }
};
