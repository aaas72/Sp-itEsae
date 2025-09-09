const mongoose = require('mongoose');
const Debt = require('../models/Debt');
const Group = require('../models/Group');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get total amount spent in a group
 * @route   GET /api/analytics/group/:groupId/total
 * @access  Private
 */
const getGroupTotalAmount = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('🔍 [Analytics Controller] getGroupTotalAmount called:', {
      groupId,
      userId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log('❌ [Analytics Controller] Invalid group ID format:', groupId);
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Invalid group ID format')
      );
    }

    // Verify group membership
    const group = await Group.findById(groupId);
    console.log('🔍 [Analytics Controller] Group found:', {
      groupExists: !!group,
      groupId: group?._id,
      membersCount: group?.members?.length,
      userIsMember: group?.members?.some(m => m.userId.toString() === userId)
    });
    
    if (!group || !group.members.some(m => m.userId.toString() === userId)) {
      console.log('❌ [Analytics Controller] Group not found or user not a member:', {
        groupExists: !!group,
        userId,
        groupMembers: group?.members?.map(m => ({ userId: m.userId.toString(), role: m.role }))
      });
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Group not found or you are not a member')
      );
    }

    // Calculate total amount
    const result = await Debt.aggregate([
      { $match: { groupId: new mongoose.Types.ObjectId(groupId) } },
      { $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          activeAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$amount', 0] }
          },
          settledAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'settled'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const stats = result[0] || { totalAmount: 0, totalCount: 0, activeAmount: 0, settledAmount: 0 };
    
    console.log('✅ [Analytics Controller] getGroupTotalAmount success:', {
      groupId,
      userId,
      result: stats
    });
    
    res.status(200).json(createSuccessResponse(stats, 'Group total amounts retrieved successfully'));
  } catch (error) {
    console.error('💥 [ERROR] Get Group Total:', error);
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};

/**
 * @desc    Get monthly analysis of group spending
 * @route   GET /api/analytics/group/:groupId/monthly
 * @access  Private
 */
const getMonthlyAnalysis = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('🔍 [Analytics Controller] getMonthlyAnalysis called:', {
      groupId,
      userId
    });

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log('❌ [Analytics Controller] Invalid group ID format in getMonthlyAnalysis:', groupId);
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Invalid group ID format')
      );
    }

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.userId.toString() === userId)) {
      console.log('❌ [Analytics Controller] Group not found or user not a member in getMonthlyAnalysis:', {
        groupExists: !!group,
        userId
      });
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Group not found or you are not a member')
      );
    }

    // Get data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Debt.aggregate([
      {
        $match: {
          groupId: new mongoose.Types.ObjectId(groupId),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'debtorId',
          foreignField: '_id',
          as: 'debtorInfo'
        }
      },
      {
        $unwind: '$debtorInfo'
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          userDetails: {
            $push: {
              userId: '$debtorId',
              userName: '$debtorInfo.name',
              userEmail: '$debtorInfo.email',
              amount: '$amount'
            }
          }
        }
      },
      {
        $addFields: {
          userDetails: {
            $reduce: {
              input: '$userDetails',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        cond: { $eq: ['$$this.userId', '$$this.userId'] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$existing' }, 0] },
                      {
                        $map: {
                          input: '$$value',
                          in: {
                            $cond: [
                              { $eq: ['$$this.userId', '$$this.userId'] },
                              {
                                userId: '$$this.userId',
                                userName: '$$this.userName',
                                userEmail: '$$this.userEmail',
                                totalAmount: { $add: ['$$this.totalAmount', '$$this.amount'] }
                              },
                              '$$this'
                            ]
                          }
                        }
                      },
                      {
                        $concatArrays: [
                          '$$value',
                          [{
                            userId: '$$this.userId',
                            userName: '$$this.userName',
                            userEmail: '$$this.userEmail',
                            totalAmount: '$$this.amount'
                          }]
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Simplify user details aggregation
    const simplifiedMonthlyData = await Promise.all(
      monthlyData.map(async (monthData) => {
        const userSummary = await Debt.aggregate([
          {
            $match: {
              groupId: new mongoose.Types.ObjectId(groupId),
              createdAt: {
                $gte: new Date(monthData._id.year, monthData._id.month - 1, 1),
                $lt: new Date(monthData._id.year, monthData._id.month, 1)
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'debtorId',
              foreignField: '_id',
              as: 'debtorInfo'
            }
          },
          {
            $unwind: '$debtorInfo'
          },
          {
            $group: {
              _id: '$debtorId',
              userName: { $first: '$debtorInfo.name' },
              userEmail: { $first: '$debtorInfo.email' },
              totalAmount: { $sum: '$amount' },
              transactionCount: { $sum: 1 }
            }
          }
        ]);

        return {
          ...monthData,
          userDetails: userSummary.map(user => ({
            userId: user._id,
            userName: user.userName,
            userEmail: user.userEmail,
            totalAmount: user.totalAmount,
            transactionCount: user.transactionCount
          }))
        };
      })
    );

    console.log('✅ [Analytics Controller] getMonthlyAnalysis success:', {
      groupId,
      userId,
      monthlyDataLength: simplifiedMonthlyData.length,
      sampleData: simplifiedMonthlyData[0]
    });

    res.status(200).json(
      createSuccessResponse(simplifiedMonthlyData, 'Monthly analysis retrieved successfully')
    );
  } catch (error) {
    console.error('❌ [Analytics Controller] Error in getMonthlyAnalysis:', {
      groupId: req.params.groupId,
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};

/**
 * @desc    Get user spending patterns in a group
 * @route   GET /api/analytics/group/:groupId/user-patterns
 * @access  Private
 */
const getUserPatterns = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    console.log('🔍 [Analytics Controller] getUserPatterns called:', {
      groupId,
      userId
    });

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      console.log('❌ [Analytics Controller] Invalid group ID format in getUserPatterns:', groupId);
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Invalid group ID format')
      );
    }

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.userId.toString() === userId)) {
      console.log('❌ [Analytics Controller] Group not found or user not a member in getUserPatterns:', {
        groupExists: !!group,
        userId
      });
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Group not found or you are not a member')
      );
    }

    const userPatterns = await Debt.aggregate([
      { 
        $match: { 
          groupId: new mongoose.Types.ObjectId(groupId),
          $or: [{ creditorId: new mongoose.Types.ObjectId(userId) }, 
                { debtorId: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$debtorId', new mongoose.Types.ObjectId(userId)] }, '$amount', 0]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [{ $eq: ['$creditorId', new mongoose.Types.ObjectId(userId)] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    console.log('✅ [Analytics Controller] getUserPatterns success:', {
      groupId,
      userId,
      patternsLength: userPatterns.length
    });

    res.status(200).json(
      createSuccessResponse(userPatterns, 'User spending patterns retrieved successfully')
    );
  } catch (error) {
    console.error('❌ [Analytics Controller] Error in getUserPatterns:', {
      groupId: req.params.groupId,
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};

/**
 * @desc    Get group summary statistics
 * @route   GET /api/analytics/group/:groupId/summary
 * @access  Private
 */
const getGroupSummary = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json(
        createErrorResponse('INVALID_ID', 'Invalid group ID format')
      );
    }

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.userId.toString() === userId)) {
      return res.status(404).json(
        createErrorResponse('GROUP_NOT_FOUND', 'Group not found or you are not a member')
      );
    }

    // Calculate summary statistics
    const summary = await Debt.aggregate([
      { $match: { groupId: new mongoose.Types.ObjectId(groupId) } },
      { 
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          totalPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'settled'] }, '$amount', 0] }
          },
          transactionsCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    const stats = summary[0] || {
      totalExpenses: 0,
      totalPayments: 0,
      transactionsCount: 0,
      averageAmount: 0,
      maxAmount: 0,
      minAmount: 0
    };

    // Calculate net amount
    stats.netAmount = stats.totalExpenses - stats.totalPayments;

    res.status(200).json(
      createSuccessResponse(stats, 'Group summary statistics retrieved successfully')
    );
  } catch (error) {
    console.error('💥 [ERROR] Get Group Summary:', error);
    res.status(500).json(createErrorResponse('INTERNAL_ERROR', error.message));
  }
};

module.exports = {
  getGroupTotalAmount,
  getMonthlyAnalysis,
  getUserPatterns,
  getGroupSummary
};