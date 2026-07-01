import Recipe from '../models/Recipe.js';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils.js';

const populateReport = (query) => query.populate('recipeId').populate('reporterId', 'name email image');

export const getReports = asyncHandler(async (_req, res) => {
  const reports = await populateReport(Report.find()).sort({ createdAt: -1 });
  return res.json(reports);
});

export const dismissReport = asyncHandler(async (req, res) => {
  let report = await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' }, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  report = await populateReport(Report.findById(report._id));
  return res.json({ message: 'Report dismissed.', report });
});

export const removeReportedRecipe = asyncHandler(async (req, res) => {
  let report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  await Recipe.findByIdAndUpdate(report.recipeId, { status: 'removed' });
  report.status = 'removed';
  await report.save();
  report = await populateReport(Report.findById(report._id));
  return res.json({ message: 'Reported recipe removed.', report });
});
