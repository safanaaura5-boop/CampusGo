/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import 'dotenv/config';
import { dbPool, verifyDatabaseConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import attendantRoutes from './routes/attendantRoutes.js';
import spotRoutes from './routes/spotRoutes.js';

export function createApiApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    try {
      await dbPool.query('SELECT 1');
      return res.json({
        status: 'ok',
        service: 'E-Parking Pangkalpinang API',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Database health check error:', err);
      return res.status(503).json({
        status: 'error',
        service: 'E-Parking Pangkalpinang API',
        database: 'unavailable',
      });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/attendant', attendantRoutes);
  app.use('/api/spots', spotRoutes);

  return app;
}

async function startServer() {
  await verifyDatabaseConnection();
  console.log('Connected to MySQL database eparking_pangkalpinang.');

  const app = createApiApp();
  const PORT = Number(process.env.PORT) || 3001;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Parking Pangkalpinang API running at http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Failed to listen for API requests:', err);
    void dbPool.end().catch((closeError) => {
      console.error('Failed to close MySQL pool:', closeError);
    });
    process.exitCode = 1;
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(() => {
        void dbPool.end().then(
          () => {
            process.exitCode = 0;
          },
          (err) => {
            console.error('Failed to close MySQL pool:', err);
            process.exitCode = 1;
          }
        );
      });
    });
  }
}

startServer().catch(async (err) => {
  console.error('Failed to start E-Parking API:', err);
  try {
    await dbPool.end();
  } catch (closeError) {
    console.error('Failed to close MySQL pool:', closeError);
  }
  process.exitCode = 1;
});
