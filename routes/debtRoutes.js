const express = require("express");
const {
  createExpenseAndDebts, 
  getUserDebts,
  getGroupDebts,
  settleDebt,
  cancelDebt,
  calculateBalance,
  settleAllDebts,
  deleteDebt,
  editDebt,
} = require("../controllers/debtController");
const authMiddleware = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// All debt routes require authentication, so a valid token must be sent in the Authorization header.
router.use(authMiddleware);

// --- Validation Rules (Defined as Arrays) ---
const createExpenseRules = [
    { field: 'groupId', required: true, isObjectId: true },
    { field: 'participants', required: true, isArray: true, containsObjectIds: true }, 
    { field: 'amount', required: true },
    { field: 'description', required: true }
];

const debtIdRules = [
    { field: 'debtId', required: true, isObjectId: true }
];

const groupIdRules = [
    { field: 'groupId', required: true, isObjectId: true }
];

const userBalanceRules = [
    { field: 'groupId', required: true, isObjectId: true },
    { field: 'userId', required: true, isObjectId: true }
];


// --- API Endpoints ---

// POST /api/debts/expenses
router.post("/expenses", validateRequest(createExpenseRules), createExpenseAndDebts);

// GET /api/debts/my-debts
router.get("/my-debts", getUserDebts);

// GET /api/debts/group/:groupId
router.get("/group/:groupId", validateRequest(groupIdRules), getGroupDebts);

// PATCH /api/debts/:debtId/settle
router.patch("/:debtId/settle", validateRequest(debtIdRules), settleDebt);

// PATCH /api/debts/:debtId/cancel
router.patch("/:debtId/cancel", validateRequest(debtIdRules), cancelDebt);

// DELETE /api/debts/:debtId
router.delete("/:debtId", validateRequest(debtIdRules), deleteDebt);

// PUT /api/debts/:debtId
router.put("/:debtId", validateRequest(debtIdRules), editDebt);

// GET /api/debts/balance/:groupId/:userId
router.get("/balance/:groupId/:userId", validateRequest(userBalanceRules), calculateBalance);

// PATCH /api/debts/settle-all/:groupId/:userId
router.patch("/settle-all/:groupId/:userId", validateRequest(userBalanceRules), settleAllDebts);

module.exports = router;

