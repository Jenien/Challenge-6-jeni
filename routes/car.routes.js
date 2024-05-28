import express from 'express';
const router = express.Router();
import { getAvailCars, getAllCars, getCarById, getCarsByType, createCar, updateCar, deleteCar } from '../controllers/car.controllers.js';
import { upload } from '../libs/multer.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

router.get('/ready', getAvailCars);
router.get('/show',getAllCars)
router.get('/show/:id', getCarById);
router.get('/show/type/:type', getCarsByType);

router.post('/add', verifyToken, verifyAdmin, upload, createCar);
router.put('/edit/:id', verifyToken, verifyAdmin, upload, updateCar);
router.delete('/delete/:id', verifyToken, verifyAdmin, deleteCar);

export default router;
