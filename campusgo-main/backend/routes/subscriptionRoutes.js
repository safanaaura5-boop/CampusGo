/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getPackages,
  getSubscriptions,
  getActiveSubscription,
  purchaseSubscription,
} from '../controllers/subscriptionController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.get('/packages', getPackages);

router.use(authenticateJWT);
router.get('/history', getSubscriptions);
router.get('/active', getActiveSubscription);
router.post('/purchase', purchaseSubscription);

export default router;
