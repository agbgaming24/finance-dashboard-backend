import { Router } from 'express';
import {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
} from '../controllers/dashboardController.js';
import { verifyToken, analystOrAdmin, allRoles } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/summary', allRoles, getSummary);
router.get('/recent-activity', allRoles, getRecentActivity);

router.get('/category-totals', analystOrAdmin, getCategoryTotals);
router.get('/monthly-trends', analystOrAdmin, getMonthlyTrends);

export default router;
