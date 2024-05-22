import express from 'express';
import { login, createUser,getUserAll, createAdmin, ensureSuperAdmin,createSuperAdmin } from '../controllers/auth.controllers.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin/register', ensureSuperAdmin, createAdmin);
router.post('/register', createUser);
router.post('/super/register', createSuperAdmin);
router.get('/user',getUserAll);

export default router;
