/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { verifyQR, checkin, getRecentCheckins } from '../controllers/attendantController.js';
import { authenticateJWT, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['ATTENDANT', 'ADMIN']));

router.post('/verify-qr', verifyQR);
router.post('/checkin', checkin);
router.get('/checkins', getRecentCheckins);

export default router;
