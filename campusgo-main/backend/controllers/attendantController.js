import { dbPool } from '../config/db.js';

export const verifyQR = async (req, res) => {
  try {
    const qrCode = String(req.body.qr_code || '').trim();
    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'Kode QR tidak boleh kosong.' });
    }

    const [subscriptions] = await dbPool.execute(
      `SELECT sh.id, sh.user_id, sh.package_id, sh.qr_code, sh.start_date, sh.end_date,
              sh.payment_status, sh.payment_method, p.package_name, p.duration_days,
              u.full_name, u.phone_number, u.nik
       FROM subscription_history sh
       JOIN \`package\` p ON p.package_id = sh.package_id
       JOIN users u ON u.user_id = sh.user_id
       WHERE sh.qr_code = ?
       LIMIT 1`,
      [qrCode]
    );
    const subscription = subscriptions[0];
    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'Kode QR tidak terdaftar dalam sistem E-Parking Pangkalpinang',
        isExpired: false,
        data: null,
      });
    }

    const subscriptionData = {
      id: subscription.id,
      user_id: subscription.user_id,
      package_id: subscription.package_id,
      qr_code: subscription.qr_code,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      payment_status: subscription.payment_status,
      payment_method: subscription.payment_method,
      package_name: subscription.package_name,
      duration_days: subscription.duration_days,
    };

    if (new Date(subscription.end_date).getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Langganan sudah kedaluwarsa. Silakan lakukan perpanjangan langganan.',
        isExpired: true,
        data: subscriptionData,
      });
    }

    if (subscription.payment_status !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: `Status langganan ${subscription.payment_status}, belum aktif.`,
        isExpired: false,
        data: subscriptionData,
      });
    }

    const [vehicles] = await dbPool.execute(
      `SELECT vehicle_id, user_id, license_plate, vehicle_type, brand, color
       FROM vehicles WHERE user_id = ? ORDER BY vehicle_id`,
      [subscription.user_id]
    );

    return res.json({
      success: true,
      message: 'Kode QR valid dan langganan aktif.',
      data: {
        valid: true,
        message: 'Langganan aktif dan valid.',
        subscription: subscriptionData,
        user: {
          user_id: subscription.user_id,
          full_name: subscription.full_name,
          phone_number: subscription.phone_number,
          nik: subscription.nik,
        },
        vehicles,
      },
    });
  } catch (err) {
    console.error('Verify parking QR error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi kode QR.' });
  }
};

export const checkin = async (req, res) => {
  try {
    const subscriptionId = Number.parseInt(req.body.subscription_id, 10);
    const spotId = Number.parseInt(req.body.spot_id, 10);
    const vehicleId = Number.parseInt(req.body.vehicle_id, 10);

    if (![subscriptionId, spotId, vehicleId].every((id) => Number.isInteger(id) && id > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Data check-in tidak lengkap: ID Langganan, Titik Parkir, dan Kendaraan wajib dipilih.',
      });
    }

    const [activeSubscriptions] = await dbPool.execute(
      `SELECT sh.id
       FROM subscription_history sh
       JOIN vehicles v ON v.user_id = sh.user_id AND v.vehicle_id = ?
       WHERE sh.id = ? AND sh.payment_status = 'PAID' AND sh.end_date > CURRENT_TIMESTAMP
       LIMIT 1`,
      [vehicleId, subscriptionId]
    );
    if (!activeSubscriptions.length) {
      return res.status(400).json({
        success: false,
        message: 'Langganan tidak aktif atau kendaraan tidak terdaftar pada pemilik langganan.',
      });
    }

    const [spots] = await dbPool.execute(
      'SELECT spot_name FROM parking_spots WHERE spot_id = ? LIMIT 1',
      [spotId]
    );
    if (!spots.length) {
      return res.status(404).json({ success: false, message: 'Titik parkir tidak ditemukan.' });
    }

    const [result] = await dbPool.execute(
      `INSERT INTO riwayat_parkir (subscription_id, attendant_id, spot_id, vehicle_id)
       VALUES (?, ?, ?, ?)`,
      [subscriptionId, req.user.user_id, spotId, vehicleId]
    );
    const [records] = await dbPool.execute(
      `SELECT id, subscription_id, attendant_id, spot_id, vehicle_id, scanned_at
       FROM riwayat_parkir WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: `Check-in berhasil! Kendaraan telah dicatat parkir di ${spots[0].spot_name}.`,
      data: records[0],
    });
  } catch (err) {
    console.error('Parking check-in error:', err);
    return res.status(500).json({ success: false, message: 'Gagal mencatat check-in parkir.' });
  }
};

export const getRecentCheckins = async (req, res) => {
  try {
    const attendantId = req.user.role === 'ATTENDANT' ? req.user.user_id : undefined;
    const filter = attendantId === undefined ? '' : 'WHERE r.attendant_id = ?';
    const query = `SELECT r.id, r.subscription_id, r.attendant_id, r.spot_id, r.vehicle_id, r.scanned_at,
                          s.spot_name, COALESCE(s.display_title, s.spot_name) AS spot_title,
                          COALESCE(v.license_plate, 'BN -') AS license_plate,
                          COALESCE(v.vehicle_type, 'CAR') AS vehicle_type,
                          COALESCE(v.brand, '') AS vehicle_brand,
                          COALESCE(a.full_name, 'Petugas') AS attendant_name,
                          COALESCE(d.full_name, 'Pengendara') AS driver_name
                   FROM riwayat_parkir r
                   JOIN parking_spots s ON s.spot_id = r.spot_id
                   JOIN users a ON a.user_id = r.attendant_id
                   LEFT JOIN vehicles v ON v.vehicle_id = r.vehicle_id
                   LEFT JOIN subscription_history sh ON sh.id = r.subscription_id
                   LEFT JOIN users d ON d.user_id = sh.user_id
                   ${filter}
                   ORDER BY r.scanned_at DESC
                   LIMIT 30`;
    const [logs] = attendantId === undefined
      ? await dbPool.query(query)
      : await dbPool.execute(query, [attendantId]);

    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Load parking check-ins error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat log riwayat parkir.' });
  }
};
