import express from 'express';
import { getDashboard, getProjectDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Global dashboard route (Restored)
router.get('/', protect, getDashboard);

// Project-specific dashboard route
router.get('/project/:id', protect, checkProjectRole('member'), getProjectDashboard);

export default router;
