import { dbPool } from '../config/db.js';

export const getVehicles = async (req, res) => {
  try {
    const [vehicles] = await dbPool.execute(
      'SELECT vehicle_id, user_id, license_plate, vehicle_type, brand, color FROM vehicles WHERE user_id = ? ORDER BY vehicle_id DESC',
      [req.user.user_id]
    );
    return res.json({ success: true, data: vehicles });
  } catch (err) {
    console.error('Load vehicles error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar kendaraan.' });
  }
};

export const addVehicle = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { license_plate, vehicle_type, brand, color } = req.body;

    if (!license_plate || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: 'Nomor plat dan tipe kendaraan wajib diisi.',
      });
    }

    const cleanPlate = String(license_plate).toUpperCase().trim();
    const [existing] = await dbPool.execute(
      'SELECT vehicle_id FROM vehicles WHERE license_plate = ? LIMIT 1',
      [cleanPlate]
    );
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: `Plat nomor ${cleanPlate} sudah terdaftar pada sistem.`,
      });
    }

    const vehicleType = ['CAR', 'MOTORCYCLE', 'TRUCK', 'BUS'].includes(vehicle_type)
      ? vehicle_type
      : 'CAR';
    const [result] = await dbPool.execute(
      'INSERT INTO vehicles (user_id, license_plate, vehicle_type, brand, color) VALUES (?, ?, ?, ?, ?)',
      [userId, cleanPlate, vehicleType, brand || '', color || '']
    );
    const [vehicles] = await dbPool.execute(
      'SELECT vehicle_id, user_id, license_plate, vehicle_type, brand, color FROM vehicles WHERE vehicle_id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Kendaraan berhasil didaftarkan.',
      data: vehicles[0],
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Plat nomor sudah terdaftar pada sistem.',
      });
    }
    console.error('Add vehicle error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan kendaraan.' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(vehicleId) || vehicleId < 1) {
      return res.status(400).json({ success: false, message: 'ID kendaraan tidak valid.' });
    }

    const [result] = await dbPool.execute(
      'DELETE FROM vehicles WHERE vehicle_id = ? AND user_id = ?',
      [vehicleId, req.user.user_id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan atau Anda tidak berwenang menghapusnya.',
      });
    }

    return res.json({ success: true, message: 'Kendaraan berhasil dihapus.' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus kendaraan.' });
  }
};
