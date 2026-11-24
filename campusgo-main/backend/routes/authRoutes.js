/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { login, register, getMe, getDemoAccounts } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateJWT, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
