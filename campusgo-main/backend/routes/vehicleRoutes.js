/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { getVehicles, addVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getVehicles);
router.post('/', addVehicle);
router.delete('/:id', deleteVehicle);

export default router;
