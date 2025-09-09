const mongoose = require('mongoose');
const { Schema } = mongoose;

const DebtSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'معرف المجموعة مطلوب'],
    index: true
  },
  creditorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف الدائن مطلوب'],
    index: true
  },
  debtorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'معرف المدين مطلوب'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'المبلغ مطلوب'],
    min: [0.01, 'يجب أن يكون المبلغ أكبر من صفر']
  },
  description: {
    type: String,
    required: [true, 'الوصف مطلوب'],
    trim: true,
    maxlength: [200, 'الوصف لا يمكن أن يتجاوز 200 حرف']
  },
  currency: {
    type: String,
    required: true,
    default: 'SAR',
    enum: ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'TRY']
  },
  status: {
    type: String,
    enum: ['active', 'settled', 'disputed', 'cancelled'],
    default: 'active',
    index: true
  },
  settledAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

/**
 * Indexes for better performance
 */
DebtSchema.index({ creditorId: 1, debtorId: 1, status: 1 });
DebtSchema.index({ groupId: 1, status: 1 });

/**
 * Static Methods
 */

/**
 * Find active debts by group ID
 */
DebtSchema.statics.findActiveByGroupId = function(groupId) {
  return this.find({
    groupId,
    status: 'active'
  })
    .populate('creditorId', 'name email avatar')
    .populate('debtorId', 'name email avatar')
    .sort({ createdAt: -1 });
};

/**
 * Find debts by user ID (either as creditor or debtor)
 */
DebtSchema.statics.findByUserId = function(userId) {
  return this.find({
    $or: [
      { creditorId: userId },
      { debtorId: userId }
    ]
  })
    .populate('creditorId', 'name email avatar')
    .populate('debtorId', 'name email avatar')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Calculate balance between two users in a group
 */
DebtSchema.statics.calculateBalance = async function(groupId, user1Id, user2Id) {
  const debts = await this.find({
    groupId,
    status: 'active',
    $or: [
      { creditorId: user1Id, debtorId: user2Id },
      { creditorId: user2Id, debtorId: user1Id }
    ]
  });

  let balance = 0;
  
  debts.forEach(debt => {
    if (debt.creditorId.toString() === user1Id.toString()) {
      balance += debt.amount;
    } else {
      balance -= debt.amount;
    }
  });
  
  return balance;
};

/**
 * Settle debt
 */
DebtSchema.methods.settle = function() {
  this.status = 'settled';
  this.settledAt = new Date();
  return this.save();
};

/**
 * Cancel debt
 */
DebtSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

module.exports = mongoose.model('Debt', DebtSchema);