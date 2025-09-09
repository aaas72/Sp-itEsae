const Debt = require("../models/Debt");
const Group = require("../models/Group");
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/responseHelper");
const mongoose = require("mongoose");

// ... The createExpenseAndDebts, getUserDebts, getGroupDebts, and settleDebt functions remain the same ...
/**
 * @desc    Create a new expense and split it into individual debts
 * @route   POST /api/debts/expenses
 * @access  Private
 */
const createExpenseAndDebts = async (req, res) => {
  try {
    const { groupId, amount, description, participants, currency } = req.body;
    const creditorId = req.user.id; // The user making the request is the creditor

    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json(createErrorResponse("GROUP_NOT_FOUND", "Group not found"));
    }
    const groupMembers = group.members.map((member) =>
      member.userId.toString()
    );

    if (!groupMembers.includes(creditorId)) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "Creditor is not a member of this group"
          )
        );
    }

    for (const participantId of participants) {
      if (!groupMembers.includes(participantId)) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "VALIDATION_ERROR",
              `User with ID ${participantId} is not a member of this group`
            )
          );
      }
    }

    const allInvolved = [...new Set([...participants, creditorId])];
    const splitAmount = Math.round((amount / allInvolved.length) * 100) / 100; // Round to 2 decimal places

    const debtsToCreate = [];
    const debtors = participants.filter((p) => p !== creditorId);

    for (const debtorId of debtors) {
      debtsToCreate.push({
        groupId,
        creditorId,
        debtorId,
        originalAmount: amount,
        amount: splitAmount,
        description,
        currency: currency || group.currency || "SAR",
        // --- FIX: Added the required createdBy field ---
        createdBy: req.user.id,
      });
    }

    if (debtsToCreate.length === 0) {
      return res
        .status(200)
        .json(
          createSuccessResponse(
            null,
            "The payer is the only one involved. No debts created."
          )
        );
    }

    const createdDebts = await Debt.insertMany(debtsToCreate);
    res
      .status(201)
      .json(
        createSuccessResponse(
          createdDebts,
          "Expense created and debts split successfully"
        )
      );
  } catch (error) {
    console.error("💥 [ERROR] Create Expense:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res
        .status(400)
        .json(
          createErrorResponse("VALIDATION_ERROR", "Validation failed", {
            errors,
          })
        );
    }
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

/**
 * @desc    Get all debts for the logged-in user
 * @route   GET /api/debts/my-debts
 * @access  Private
 */
const getUserDebts = async (req, res) => {
  try {
    const userId = req.user.id;
    const debts = await Debt.find({
      $or: [{ creditorId: userId }, { debtorId: userId }],
    })
      .populate("creditorId", "name avatar")
      .populate("debtorId", "name avatar")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(createSuccessResponse(debts, "User debts retrieved successfully"));
  } catch (error) {
    console.error("💥 [ERROR] Get User Debts:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

/**
 * @desc    Get all debts for a specific group
 * @route   GET /api/debts/group/:groupId
 * @access  Private
 */
const getGroupDebts = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (
      !group ||
      !group.members.some((m) => m.userId.toString() === req.user.id)
    ) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "GROUP_NOT_FOUND",
            "Group not found or you are not a member"
          )
        );
    }

    const debts = await Debt.find({ groupId })
      .populate("creditorId", "name avatar")
      .populate("debtorId", "name avatar")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(createSuccessResponse(debts, "Group debts retrieved successfully"));
  } catch (error) {
    console.error("💥 [ERROR] Get Group Debts:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

/**
 * @desc    Settle a debt
 * @route   PATCH /api/debts/:debtId/settle
 * @access  Private
 */
const settleDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const userId = req.user.id;

    const debt = await Debt.findById(debtId);

    if (!debt) {
      return res
        .status(404)
        .json(createErrorResponse("DEBT_NOT_FOUND", "Debt not found"));
    }

    if (debt.status === "settled") {
      return res
        .status(400)
        .json(createErrorResponse("ALREADY_SETTLED", "This debt has already been settled"));
    }

    if (debt.creditorId.toString() !== userId && debt.debtorId.toString() !== userId) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "Only the creditor or debtor can settle this debt"
          )
        );
    }

    debt.status = "settled";
    debt.settledAt = new Date();
    await debt.save();

    res
      .status(200)
      .json(createSuccessResponse(debt, "Debt settled successfully"));
  } catch (error) {
    console.error("💥 [ERROR] Settle Debt:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

/**
 * @desc    Calculate the net balance between the current user and another user in a group.
 * @route   GET /api/debts/balance/:groupId/:userId
 * @access  Private
 */
const deleteDebt = async (req, res) => {
  try {
    const debtId = req.params.debtId;
    const userId = req.user.id;

    const debt = await Debt.findById(debtId);
    if (!debt) {
      return res.status(404).json(createErrorResponse('DEBT_NOT_FOUND', 'Debt not found'));
    }

    // Check if user is creditor or debtor
    if (debt.creditorId.toString() !== userId && debt.debtorId.toString() !== userId) {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'You are not authorized to delete this debt'));
    }

    await Debt.findByIdAndDelete(debtId);
    res.status(200).json(createSuccessResponse(null, 'Debt deleted successfully'));
  } catch (error) {
    console.error('💥 [ERROR] Delete Debt:', error);
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};



const editDebt = async (req, res) => {
  try {
    const debtId = req.params.debtId;
    const userId = req.user.id;
    const { amount, description } = req.body;

    const debt = await Debt.findById(debtId);
    if (!debt) {
      return res.status(404).json(createErrorResponse('DEBT_NOT_FOUND', 'Debt not found'));
    }

    // التحقق من أن المستخدم هو الدائن
    if (debt.creditorId.toString() !== userId) {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'Only the creditor can edit this debt'));
    }

    if (amount) debt.amount = amount;
    if (description) debt.description = description;

    await debt.save();
    res.status(200).json(createSuccessResponse(debt, 'Debt updated successfully'));
  } catch (error) {
    console.error('💥 [ERROR] Edit Debt:', error);
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};

const calculateBalance = async (req, res) => {
  try {
    const { groupId, userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Find all pending debts in the group between the two users
    const debts = await Debt.find({
      groupId: groupId,
      status: "active",
      $or: [
        { creditorId: currentUserId, debtorId: otherUserId },
        { creditorId: otherUserId, debtorId: currentUserId },
      ],
    });

    let balance = 0;
    let currency = "USD"; // Default currency

    // Calculate the net balance
    debts.forEach((debt) => {
      if (debt.currency) currency = debt.currency; // Use currency from the last found debt
      if (debt.creditorId.toString() === currentUserId) {
        // If the current user is the creditor, the other user owes them.
        balance += debt.amount;
      } else {
        // If the other user is the creditor, the current user owes them.
        balance -= debt.amount;
      }
    });

    const roundedBalance = Math.round(balance * 100) / 100;

    const result = {
      balance: roundedBalance,
      currency: currency,
      // A positive balance means the other user owes the current user.
      // A negative balance means the current user owes the other user.
      message:
        roundedBalance > 0
          ? `User ${otherUserId} owes you ${roundedBalance} ${currency}.`
          : roundedBalance < 0
          ? `You owe user ${otherUserId} ${Math.abs(
              roundedBalance
            )} ${currency}.`
          : `You are settled up with user ${otherUserId}.`,
    };

    res
      .status(200)
      .json(createSuccessResponse(result, "Balance calculated successfully"));
  } catch (error) {
    console.error("💥 [ERROR] Calculate Balance:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

/**
 * @desc    Settle all pending debts between the current user and another user.
 * @route   PATCH /api/debts/settle-all/:groupId/:userId
 * @access  Private
 */
const settleAllDebts = async (req, res) => {
  try {
    const { groupId, userId: otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Find all pending debts to calculate the balance
    const debts = await Debt.find({
      groupId: groupId,
      status: "active",
      $or: [
        { creditorId: currentUserId, debtorId: otherUserId },
        { creditorId: otherUserId, debtorId: currentUserId },
      ],
    });

    if (debts.length === 0) {
      return res
        .status(200)
        .json(createSuccessResponse(null, "No pending debts to settle."));
    }

    let balance = 0;
    debts.forEach((debt) => {
      if (debt.creditorId.toString() === currentUserId) {
        balance += debt.amount;
      } else {
        balance -= debt.amount;
      }
    });

    // Security check: Only the net creditor can settle all debts.
    if (balance <= 0) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "Only the net creditor can settle all debts. Settle individual debts if you have paid."
          )
        );
    }

    // Use updateMany for efficiency
    const updateResult = await Debt.updateMany(
      {
        groupId: groupId,
        status: "pending",
        $or: [
          { creditorId: currentUserId, debtorId: otherUserId },
          { creditorId: otherUserId, debtorId: currentUserId },
        ],
      },
      {
        $set: {
          status: "settled",
          settledAt: new Date(),
        },
      }
    );

    res.status(200).json(
      createSuccessResponse(
        {
          settledCount: updateResult.modifiedCount,
        },
        "All debts have been settled successfully."
      )
    );
  } catch (error) {
    console.error("💥 [ERROR] Settle All Debts:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

// --- Placeholder Function ---
const cancelDebt = async (req, res) => {
  res
    .status(501)
    .json(
      createErrorResponse(
        "NOT_IMPLEMENTED",
        "Cancel debt functionality is not yet implemented."
      )
    );
};

module.exports = {
  createExpenseAndDebts,
  getUserDebts,
  getGroupDebts,
  settleDebt,
  deleteDebt,
  editDebt,
  cancelDebt,
  calculateBalance,
  settleAllDebts,
};
