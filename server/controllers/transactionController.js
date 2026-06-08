const Transaction = require('../models/Transaction');
const Debt = require('../models/Debt');
const Group = require('../models/Group');
const User = require('../models/User');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');
const { logActivity } = require('./activityController');
const mongoose = require('mongoose');

/**
 * @desc    Create a new expense transaction and split it into debts
 * @route   POST /api/transactions/expense
 * @access  Private
 */
const createExpenseTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { groupId, amount, description, participants, currency } = req.body;
    const payerId = req.user.id;

    console.log('🔍 [Transaction Controller] Creating expense transaction:', {
      groupId,
      amount,
      description,
      participants,
      payerId
    });

    // Validate group and membership
    const group = await Group.findById(groupId).session(session);
    if (!group) {
      await session.abortTransaction();
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı')
      );
    }

    const groupMembers = group.members.map(member => member.userId.toString());
    if (!groupMembers.includes(payerId)) {
      await session.abortTransaction();
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'Bu grubun üyesi değilsiniz')
      );
    }

    // Validate all participants are group members
    for (const participantId of participants) {
      if (!groupMembers.includes(participantId)) {
        await session.abortTransaction();
        return res.status(400).json(
          createErrorResponse(
            'VALIDATION_ERROR',
            `${participantId} ID'li kullanıcı bu grubun üyesi değil`
          )
        );
      }
    }

    // Get payer details
    const payer = await User.findById(payerId).session(session);
    if (!payer) {
      await session.abortTransaction();
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'Ödeyen bulunamadı')
      );
    }

    // Get participants details
    const participantUsers = await User.find({
      _id: { $in: participants }
    }).session(session);

    if (participantUsers.length !== participants.length) {
      await session.abortTransaction();
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Bazı katılımcılar bulunamadı')
      );
    }

    // Calculate split amount
    const allInvolved = [...new Set([...participants, payerId])];
    const splitAmount = Math.round((amount / allInvolved.length) * 100) / 100;

    // Prepare participants data for transaction
    const transactionParticipants = participantUsers.map(user => ({
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      shareAmount: splitAmount
    }));

    // Add payer to participants if not already included
    const payerInParticipants = participants.includes(payerId);
    if (!payerInParticipants) {
      transactionParticipants.push({
        userId: payer._id,
        name: payer.name,
        avatar: payer.avatar,
        shareAmount: splitAmount
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      groupId,
      payerId,
      payerName: payer.name,
      payerAvatar: payer.avatar,
      totalAmount: amount,
      description,
      currency: currency || group.currency || 'SAR',
      participants: transactionParticipants,
      type: 'expense',
      createdBy: payerId
    });

    const savedTransaction = await transaction.save({ session });

    // Create debts (exclude payer from debtors)
    const debtsToCreate = [];
    const debtors = participants.filter(p => p !== payerId);

    for (const debtorId of debtors) {
      debtsToCreate.push({
        groupId,
        creditorId: payerId,
        debtorId,
        amount: splitAmount,
        description,
        currency: currency || group.currency || 'SAR',
        createdBy: payerId
      });
    }

    let createdDebts = [];
    if (debtsToCreate.length > 0) {
      createdDebts = await Debt.insertMany(debtsToCreate, { session });
      
      // Link debts to transaction
      savedTransaction.relatedDebts = createdDebts.map(debt => debt._id);
      await savedTransaction.save({ session });
    }

    await session.commitTransaction();

    console.log('✅ [Transaction Controller] Expense transaction created successfully:', {
      transactionId: savedTransaction._id,
      debtsCount: createdDebts.length
    });

    // تسجيل نشاط إضافة المعاملة
    try {
      await logActivity({
        groupId: groupId,
        type: 'expense_added',
        performedBy: payerId,
        relatedId: savedTransaction._id,
        relatedType: 'expense',
        description: `${payer.name} harcama ekledi: ${description}`,
        metadata: {
          amount: amount,
          currency: currency || group.currency || 'SAR',
          participantsCount: allInvolved.length,
          splitAmount: splitAmount,
          debtsCreated: createdDebts.length
        },
        isImportant: true
      });
    } catch (activityError) {
      console.error('⚠️ [ACTIVITY]'.yellow + ' Failed to log expense activity:', activityError.message);
    }

    // Populate the response
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('payerId', 'name email avatar')
      .populate('participants.userId', 'name email avatar')
      .populate('groupId', 'name');

    res.status(201).json(
      createSuccessResponse(
        {
          transaction: populatedTransaction,
          debtsCreated: createdDebts.length,
          splitAmount
        },
        'Harcama işlemi başarıyla oluşturuldu'
      )
    );
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ [Transaction Controller] Error creating expense transaction:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', error.message)
    );
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get transactions for a group
 * @route   GET /api/transactions/group/:groupId
 * @access  Private
 */
const getGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    console.log('🔍 [Transaction Controller] Getting group transactions:', {
      groupId,
      userId,
      page,
      limit
    });

    // Validate group membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı')
      );
    }

    const groupMembers = group.members.map(member => member.userId.toString());
    if (!groupMembers.includes(userId)) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'Bu grubun üyesi değilsiniz')
      );
    }

    const transactions = await Transaction.getByGroupId(groupId, parseInt(page), parseInt(limit));
    const totalTransactions = await Transaction.countDocuments({ groupId, status: 'active' });

    console.log('✅ [Transaction Controller] Group transactions retrieved:', {
      groupId,
      transactionsCount: transactions.length,
      totalTransactions
    });

    res.status(200).json(
      createSuccessResponse(
        {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTransactions / parseInt(limit)),
            totalTransactions,
            hasNext: parseInt(page) * parseInt(limit) < totalTransactions,
            hasPrev: parseInt(page) > 1
          }
        },
        'Grup işlemleri başarıyla getirildi'
      )
    );
  } catch (error) {
    console.error('❌ [Transaction Controller] Error getting group transactions:', {
      groupId: req.params.groupId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', error.message)
    );
  }
};

/**
 * @desc    Get recent transactions for a group (for activity feed)
 * @route   GET /api/transactions/group/:groupId/recent
 * @access  Private
 */
const getRecentGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('🔍 [Transaction Controller] Getting recent group transactions:', {
      groupId,
      userId
    });

    // Validate group membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı')
      );
    }

    const groupMembers = group.members.map(member => member.userId.toString());
    if (!groupMembers.includes(userId)) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'Bu grubun üyesi değilsiniz')
      );
    }

    const transactions = await Transaction.getRecentByGroupId(groupId);

    console.log('✅ [Transaction Controller] Recent group transactions retrieved:', {
      groupId,
      transactionsCount: transactions.length
    });

    res.status(200).json(
      createSuccessResponse(
        transactions,
        'Son grup işlemleri başarıyla getirildi'
      )
    );
  } catch (error) {
    console.error('❌ [Transaction Controller] Error getting recent group transactions:', {
      groupId: req.params.groupId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', error.message)
    );
  }
};

/**
 * @desc    Get user transactions
 * @route   GET /api/transactions/user
 * @access  Private
 */
const getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    console.log('🔍 [Transaction Controller] Getting user transactions:', {
      userId,
      page,
      limit
    });

    const transactions = await Transaction.getByUserId(userId, parseInt(page), parseInt(limit));
    const totalTransactions = await Transaction.countDocuments({
      $or: [
        { payerId: userId },
        { 'participants.userId': userId }
      ],
      status: 'active'
    });

    console.log('✅ [Transaction Controller] User transactions retrieved:', {
      userId,
      transactionsCount: transactions.length,
      totalTransactions
    });

    res.status(200).json(
      createSuccessResponse(
        {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTransactions / parseInt(limit)),
            totalTransactions,
            hasNext: parseInt(page) * parseInt(limit) < totalTransactions,
            hasPrev: parseInt(page) > 1
          }
        },
        'Kullanıcı işlemleri başarıyla getirildi'
      )
    );
  } catch (error) {
    console.error('❌ [Transaction Controller] Error getting user transactions:', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', error.message)
    );
  }
};

/**
 * @desc    Get transaction details by ID
 * @route   GET /api/transactions/:transactionId
 * @access  Private
 */
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    console.log('🔍 [Transaction Controller] Getting transaction by ID:', {
      transactionId,
      userId
    });

    const transaction = await Transaction.findById(transactionId)
      .populate('payerId', 'name email avatar')
      .populate('participants.userId', 'name email avatar')
      .populate('groupId', 'name')
      .populate('relatedDebts');

    if (!transaction) {
      return res.status(404).json(
        createErrorResponse('TRANSACTION_NOT_FOUND', 'İşlem bulunamadı')
      );
    }

    // Check if user has access to this transaction
    const group = await Group.findById(transaction.groupId);
    const groupMembers = group.members.map(member => member.userId.toString());
    
    if (!groupMembers.includes(userId)) {
      return res.status(403).json(
        createErrorResponse('FORBIDDEN', 'Bu işleme erişim yetkiniz yok')
      );
    }

    console.log('✅ [Transaction Controller] Transaction retrieved:', {
      transactionId,
      userId
    });

    res.status(200).json(
      createSuccessResponse(
        transaction,
        'İşlem başarıyla getirildi'
      )
    );
  } catch (error) {
    console.error('❌ [Transaction Controller] Error getting transaction by ID:', {
      transactionId: req.params.transactionId,
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', error.message)
    );
  }
};

module.exports = {
  createExpenseTransaction,
  getGroupTransactions,
  getRecentGroupTransactions,
  getUserTransactions,
  getTransactionById
};