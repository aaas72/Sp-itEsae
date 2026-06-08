const Debt = require("../models/Debt");
const Group = require("../models/Group");
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const {
  createSuccessResponse,
  createErrorResponse,
} = require("../utils/responseHelper");
const mongoose = require("mongoose");

/**
 * @desc    Create debt(s) - splits among multiple debtors if needed
 * @route   POST /api/debts/:groupId
 * @access  Private
 */
const createDebt = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { creditorId, participants, amount, description, currency } = req.body;

    console.log("💰 [DEBT]".cyan + " Creating debt in group:", groupId);

    // Validate group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.userId.toString() === req.user.id)) {
      return res.status(404).json(
        createErrorResponse("GROUP_NOT_FOUND", "Grup bulunamadı veya üye değilsiniz")
      );
    }

    if (!creditorId || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json(
        createErrorResponse("VALIDATION_ERROR", "Alacaklı ve en az bir borçlu gereklidir")
      );
    }

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json(
        createErrorResponse("VALIDATION_ERROR", "Geçerli bir tutar gereklidir")
      );
    }

    // Calculate per-person amount
    const totalAmount = parseFloat(amount);
    const perPersonAmount = Math.round((totalAmount / participants.length) * 100) / 100;

    const createdDebts = [];

    for (const debtorId of participants) {
      if (debtorId === creditorId) continue; // Skip if debtor is same as creditor

      const debt = new Debt({
        groupId,
        creditorId,
        debtorId,
        amount: perPersonAmount,
        description: description || '',
        currency: currency || group.currency || 'TRY',
        status: 'active',
        createdBy: req.user.id
      });

      await debt.save();
      createdDebts.push(debt);
    }

    // Populate the created debts
    const populatedDebts = await Debt.find({
      _id: { $in: createdDebts.map(d => d._id) }
    })
      .populate('creditorId', 'name avatar')
      .populate('debtorId', 'name avatar');

    console.log("✅ [DEBT]".green + ` ${createdDebts.length} borç başarıyla oluşturuldu`);

    res.status(201).json(
      createSuccessResponse(populatedDebts, "Borç başarıyla oluşturuldu")
    );
  } catch (error) {
    console.error("💥 [ERROR] Create Debt:", error);
    res.status(500).json(createErrorResponse("INTERNAL_ERROR", error.message));
  }
};

// ... The createExpenseAndDebts, getUserDebts, getGroupDebts, and settleDebt functions remain the same ...
/**
 * @desc    Create an expense and split it into debts (DEPRECATED - Use Transaction API)
 * @route   POST /api/debts/expenses
 * @access  Private
 * @deprecated Use POST /api/transactions/expense instead
 */
const createExpenseAndDebts = async (req, res) => {
  try {
    console.log('⚠️ [Debt Controller] DEPRECATED: createExpenseAndDebts called. Use Transaction API instead.');
    
    // Redirect to transaction controller logic
    const { createExpenseTransaction } = require('./transactionController');
    return await createExpenseTransaction(req, res);
  } catch (error) {
    console.error("💥 [ERROR] Create Expense (Deprecated):", error);
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
      .json(createSuccessResponse(debts, "Kullanıcı borçları başarıyla getirildi"));
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
            "Grup bulunamadı veya üye değilsiniz"
          )
        );
    }

    const debts = await Debt.find({ groupId })
      .populate("creditorId", "name avatar")
      .populate("debtorId", "name avatar")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(createSuccessResponse(debts, "Grup borçları başarıyla getirildi"));
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
        .json(createErrorResponse("DEBT_NOT_FOUND", "Borç bulunamadı"));
    }

    if (debt.status === "settled") {
      return res
        .status(400)
        .json(createErrorResponse("ALREADY_SETTLED", "Bu borç zaten ödendi"));
    }

    if (debt.creditorId.toString() !== userId && debt.debtorId.toString() !== userId) {
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "Yalnızca alacaklı veya borçlu bu borcu ödeyebilir"
          )
        );
    }

    debt.status = "settled";
    debt.settledAt = new Date();
    await debt.save();

    res
      .status(200)
      .json(createSuccessResponse(debt, "Borç başarıyla ödendi"));
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
      return res.status(404).json(createErrorResponse('DEBT_NOT_FOUND', 'Borç bulunamadı'));
    }

    // Check if user is creditor or debtor
    if (debt.creditorId.toString() !== userId && debt.debtorId.toString() !== userId) {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'Bu borcu silme yetkiniz yok'));
    }

    await Debt.findByIdAndDelete(debtId);
    res.status(200).json(createSuccessResponse(null, 'Borç başarıyla silindi'));
  } catch (error) {
    console.error('💥 [ERROR] Delete Debt:', error);
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};



const editDebt = async (req, res) => {
  try {
    const debtId = req.params.debtId;
    const userId = req.user.id;
    const { amount, description, debtorId } = req.body;

    const debt = await Debt.findById(debtId);
    if (!debt) {
      return res.status(404).json(createErrorResponse('DEBT_NOT_FOUND', 'Borç bulunamadı'));
    }

    // التحقق من أن المستخدم هو الدائن
    if (debt.creditorId.toString() !== userId) {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'Yalnızca alacaklı bu borcu düzenleyebilir'));
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Tutar sıfırdan büyük olmalıdır'));
      }
      debt.amount = parsedAmount;
    }
    if (description !== undefined) debt.description = description;

    // Update debtorId if provided and valid
    if (debtorId) {
      if (!mongoose.Types.ObjectId.isValid(debtorId)) {
        return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Geçersiz borçlu kimliği'));
      }
      if (debtorId === debt.creditorId.toString()) {
        return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Borçlu ve alacaklı aynı kişi olamaz'));
      }
      debt.debtorId = debtorId;
    }

    await debt.save();
    res.status(200).json(createSuccessResponse(debt, 'Borç başarıyla güncellendi'));
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
          ? `${otherUserId} kullanıcısı size ${roundedBalance} ${currency} borçlu.`
          : roundedBalance < 0
          ? `${otherUserId} kullanıcısına ${Math.abs(
              roundedBalance
            )} ${currency} borçlusunuz.`
          : `${otherUserId} kullanıcısı ile hesabınız kapatıldı.`,
    };

    res
      .status(200)
      .json(createSuccessResponse(result, "Bakiye başarıyla hesaplandı"));
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
        .json(createSuccessResponse(null, "Ödenecek bekleyen borç yok."));
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
            "Yalnızca net alacaklı tüm borçları ödeyebilir. Ödeme yaptıysanız borçları tek tek ödeyin."
          )
        );
    }

    // Use updateMany for efficiency
    const updateResult = await Debt.updateMany(
      {
        groupId: groupId,
        status: "active",
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
        "Tüm borçlar başarıyla ödendi."
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
        "Borç iptal etme işlevi henüz uygulanmadı."
      )
    );
};

module.exports = {
  createDebt,
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
