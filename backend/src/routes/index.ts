import { Router } from 'express';
import userRoutes from './user.routes';
import meetingRoutes from './meeting.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'velora-backend',
  });
});

// Mount route groups
router.use('/users', userRoutes);
router.use('/meetings', meetingRoutes);

export default router;
