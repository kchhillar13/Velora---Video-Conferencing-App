import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/users/sync — Create or update user from Clerk
router.post('/sync', authMiddleware, (req, res) => userController.syncUser(req, res));

// GET /api/users/me — Get current user profile
router.get('/me', authMiddleware, (req, res) => userController.getMe(req, res));

export default router;
