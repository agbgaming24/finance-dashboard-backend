import RecordModel from '../models/recordModel.js';
import { sendSuccess, sendError, paginate, buildPaginationMeta } from '../utils/response.js';

export const createRecord = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const id = await RecordModel.create({
      user_id: req.user.id,
      amount,
      type,
      category,
      date,
      notes,
    });
    const record = await RecordModel.findById(id);
    return sendSuccess(res, record, 'Record created.', 201);
  } catch (err) {
    return sendError(res, 'Failed to create record.', 500);
  }
};

export const getAllRecords = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { type, category, startDate, endDate } = req.query;

    const { rows, total } = await RecordModel.findAll({
      page, limit, offset, type, category, startDate, endDate,
    });

    return sendSuccess(res, {
      records: rows,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (err) {
    return sendError(res, 'Failed to fetch records.', 500);
  }
};

export const getRecordById = async (req, res) => {
  try {
    const record = await RecordModel.findById(req.params.id);
    if (!record) return sendError(res, 'Record not found.', 404);
    return sendSuccess(res, record);
  } catch (err) {
    return sendError(res, 'Failed to fetch record.', 500);
  }
};

export const updateRecord = async (req, res) => {
  try {
    const record = await RecordModel.findById(req.params.id);
    if (!record) return sendError(res, 'Record not found.', 404);

    await RecordModel.update(req.params.id, req.body);
    const updated = await RecordModel.findById(req.params.id);
    return sendSuccess(res, updated, 'Record updated.');
  } catch (err) {
    return sendError(res, 'Failed to update record.', 500);
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await RecordModel.findById(req.params.id);
    if (!record) return sendError(res, 'Record not found.', 404);

    await RecordModel.softDelete(req.params.id);
    return sendSuccess(res, null, 'Record deleted.');
  } catch (err) {
    return sendError(res, 'Failed to delete record.', 500);
  }
};
