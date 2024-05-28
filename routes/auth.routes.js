import express from 'express';
import { login, createUser,getUserAll, createAdmin, createSuperAdmin, getMe } from '../controllers/auth.controllers.js';
import verifyToken from '../middlewares/verifyToken.js';
// import verifyAdmin from '../middlewares/verifyAdmin.js';
import ensureSuperAdmin from '../middlewares/ensureSuperAdmin.js';
import refreshToken from '../middlewares/refreshToken.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin/register', ensureSuperAdmin,verifyToken, createAdmin);
router.post('/register', createUser);
router.post('/super/register', createSuperAdmin);
router.post('/reload', refreshToken)
router.get('/user',getUserAll);
router.get('/me',verifyToken,getMe);

export default router;
