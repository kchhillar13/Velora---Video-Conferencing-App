import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/meetings — Create a new meeting
router.post('/', authMiddleware, (req, res) => meetingController.create(req, res));

// GET /api/meetings — List user's meetings (filter via query params)
router.get('/', authMiddleware, (req, res) => meetingController.list(req, res));

// GET /api/meetings/:code — Get meeting by code
router.get('/:code', authMiddleware, (req, res) => meetingController.getByCode(req, res));

// PATCH /api/meetings/:id/status — Update meeting status
router.patch('/:id/status', authMiddleware, (req, res) => meetingController.updateStatus(req, res));

// GET /api/meetings/:id/recordings — Get recordings for a meeting
router.get('/:id/recordings', authMiddleware, (req, res) => meetingController.getRecordings(req, res));

export default router;
