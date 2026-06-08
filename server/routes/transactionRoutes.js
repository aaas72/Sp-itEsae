const express = require('express');
const {
  createExpenseTransaction,
  getGroupTransactions,
  getRecentGroupTransactions,
  getUserTransactions,
  getTransactionById
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const { validateCreateExpense } = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/transactions/expense
 * @desc    Create a new expense transaction
 * @access  Private
 */
router.post('/expense', validateCreateExpense, createExpenseTransaction);

/**
 * @route   GET /api/transactions/group/:groupId
 * @desc    Get transactions for a specific group (paginated)
 * @access  Private
 */
router.get('/group/:groupId', getGroupTransactions);

/**
 * @route   GET /api/transactions/group/:groupId/recent
 * @desc    Get recent transactions for a group (for activity feed)
 * @access  Private
 */
router.get('/group/:groupId/recent', getRecentGroupTransactions);

/**
 * @route   GET /api/transactions/user
 * @desc    Get transactions for the authenticated user (paginated)
 * @access  Private
 */
router.get('/user', getUserTransactions);

/**
 * @route   GET /api/transactions/:transactionId
 * @desc    Get transaction details by ID
 * @access  Private
 */
router.get('/:transactionId', getTransactionById);

module.exports = router;

/**
 * Transaction Routes Documentation
 * 
 * Base URL: /api/transactions
 * 
 * Routes:
 * 1. POST /expense
 *    - Creates a new expense transaction and splits it into debts
 *    - Body: { groupId, amount, description, participants, currency }
 *    - Returns: Created transaction with participants details
 * 
 * 2. GET /group/:groupId
 *    - Gets paginated transactions for a group
 *    - Query: page, limit
 *    - Returns: Transactions array with pagination info
 * 
 * 3. GET /group/:groupId/recent
 *    - Gets recent transactions for activity feed
 *    - Returns: Recent transactions (last 10)
 * 
 * 4. GET /user
 *    - Gets paginated transactions for authenticated user
 *    - Query: page, limit
 *    - Returns: User's transactions with pagination info
 * 
 * 5. GET /:transactionId
 *    - Gets detailed transaction information
 *    - Returns: Full transaction details with populated data
 * 
 * All routes require authentication via JWT token
 * Group-related routes validate group membership
 */