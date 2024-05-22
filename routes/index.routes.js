import express from 'express';
const router = express.Router();

import authRoutes from './auth.routes.js';
import carRoutes from './car.routes.js';

router.use('/auth', authRoutes);
router.use('/cars', carRoutes);

export default router;
