import Recipe from '../models/Recipe.js';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils.js';

export const getReports = asyncHandler(async (_req, res) => {
  const reports = await Report.find().populate('recipeId').populate('reporterId', 'name email image').sort({ createdAt: -1 });
  return res.json(reports);
});

export const dismissReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' }, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  return res.json({ message: 'Report dismissed.', report });
});

export const removeReportedRecipe = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  await Recipe.findByIdAndUpdate(report.recipeId, { status: 'removed' });
  report.status = 'removed';
  await report.save();
  return res.json({ message: 'Reported recipe removed.', report });
});
