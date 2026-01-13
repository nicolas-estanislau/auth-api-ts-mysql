import { Router } from 'express';
import { login, refreshToken, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);


export default router;