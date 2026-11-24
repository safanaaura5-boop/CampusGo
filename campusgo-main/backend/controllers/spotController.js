import { dbPool } from '../config/db.js';

const spotColumns = `spot_id, spot_name, display_title, address,
                     ST_X(location) AS latitude, ST_Y(location) AS longitude`;

export const getSpots = async (req, res) => {
  try {
    const search = String(req.query.query || '').trim();
    const [spots] = search
      ? await dbPool.execute(
          `SELECT ${spotColumns} FROM parking_spots
           WHERE LOWER(spot_name) LIKE ? OR LOWER(display_title) LIKE ? OR LOWER(address) LIKE ?
           ORDER BY spot_id`,
          [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`]
        )
      : await dbPool.query(
          `SELECT ${spotColumns} FROM parking_spots ORDER BY spot_id`
        );

    return res.json({ success: true, count: spots.length, data: spots });
  } catch (err) {
    console.error('Load parking spots error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat titik lokasi parkir Pangkalpinang.',
    });
  }
};

export const getSpotById = async (req, res) => {
  try {
    const spotId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(spotId) || spotId < 1) {
      return res.status(400).json({ success: false, message: 'ID titik parkir tidak valid.' });
    }

    const [spots] = await dbPool.execute(
      `SELECT ${spotColumns} FROM parking_spots WHERE spot_id = ? LIMIT 1`,
      [spotId]
    );
    if (!spots.length) {
      return res.status(404).json({
        success: false,
        message: 'Titik parkir tidak ditemukan.',
      });
    }

    return res.json({ success: true, data: spots[0] });
  } catch (err) {
    console.error('Load parking spot error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat detail titik parkir.',
    });
  }
};
