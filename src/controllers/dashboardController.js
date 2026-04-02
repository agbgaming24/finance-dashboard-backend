import RecordModel from '../models/recordModel.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const totals = await RecordModel.getTotals({ startDate, endDate });
    return sendSuccess(res, {
      total_income: parseFloat(totals.total_income) || 0,
      total_expenses: parseFloat(totals.total_expenses) || 0,
      net_balance: parseFloat(totals.net_balance) || 0,
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch summary.', 500);
  }
};

export const getCategoryTotals = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const rows = await RecordModel.getCategoryTotals({ type, startDate, endDate });
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, 'Failed to fetch category totals.', 500);
  }
};

export const getMonthlyTrends = async (req, res) => {
  try {
    const { year } = req.query;
    const rows = await RecordModel.getMonthlyTrends({ year });
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, 'Failed to fetch monthly trends.', 500);
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const rows = await RecordModel.getRecentActivity(limit);
    return sendSuccess(res, rows);
  } catch (err) {
    return sendError(res, 'Failed to fetch recent activity.', 500);
  }
};
