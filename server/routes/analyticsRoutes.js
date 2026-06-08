const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getGroupTotalAmount,
  getMonthlyAnalysis,
  getUserPatterns,
  getGroupSummary
} = require('../controllers/analyticsController');

router.get('/group/:groupId/total', auth, getGroupTotalAmount);
router.get('/group/:groupId/monthly', auth, getMonthlyAnalysis);
router.get('/group/:groupId/user-patterns', auth, getUserPatterns);
router.get('/group/:groupId/summary', auth, getGroupSummary);

module.exports = router;