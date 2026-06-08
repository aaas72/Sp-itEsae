const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Participant Schema - للأشخاص المشاركين في المعاملة
 */
const ParticipantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  shareAmount: {
    type: Number,
    required: true,
    min: [0, 'Share amount must be positive']
  }
}, { _id: false });

/**
 * Transaction Schema - لتتبع جميع المعاملات والمصاريف
 */
const TransactionSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Grup kimliği gereklidir'],
    index: true
  },
  payerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ödeyen kimliği gereklidir'],
    index: true
  },
  payerName: {
    type: String,
    required: true
  },
  payerAvatar: {
    type: String,
    default: null
  },
  totalAmount: {
    type: Number,
    required: [true, 'Toplam tutar gereklidir'],
    min: [0.01, 'Tutar sıfırdan büyük olmalıdır']
  },
  description: {
    type: String,
    required: [true, 'Açıklama gereklidir'],
    trim: true,
    maxlength: [200, 'Açıklama 200 karakteri aşamaz']
  },
  currency: {
    type: String,
    required: true,
    default: '',
    enum: ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'TRY']
  },
  participants: [ParticipantSchema],
  type: {
    type: String,
    enum: ['expense', 'payment', 'settlement'],
    default: 'expense'
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  relatedDebts: [{
    type: Schema.Types.ObjectId,
    ref: 'Debt'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Indexes for better performance
 */
TransactionSchema.index({ groupId: 1, createdAt: -1 });
TransactionSchema.index({ payerId: 1, createdAt: -1 });
TransactionSchema.index({ 'participants.userId': 1 });

/**
 * Static Methods
 */

/**
 * Get transactions by group ID with pagination
 */
TransactionSchema.statics.getByGroupId = function(groupId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ groupId, status: 'active' })
    .populate('payerId', 'name email avatar')
    .populate('participants.userId', 'name email avatar')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get transactions by user ID (as payer or participant)
 */
TransactionSchema.statics.getByUserId = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { payerId: userId },
      { 'participants.userId': userId }
    ],
    status: 'active'
  })
    .populate('payerId', 'name email avatar')
    .populate('participants.userId', 'name email avatar')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get recent transactions for a group (last 10)
 */
TransactionSchema.statics.getRecentByGroupId = function(groupId) {
  return this.find({ groupId, status: 'active' })
    .populate('payerId', 'name email avatar')
    .populate('participants.userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(10);
};

/**
 * Instance Methods
 */

/**
 * Cancel transaction
 */
TransactionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Get formatted date and time
 */
TransactionSchema.methods.getFormattedDateTime = function() {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return this.createdAt.toLocaleDateString('ar-SA', options);
};

/**
 * Get participants count
 */
TransactionSchema.methods.getParticipantsCount = function() {
  return this.participants.length;
};

/**
 * Get total participants including payer
 */
TransactionSchema.methods.getTotalParticipantsCount = function() {
  // Check if payer is already in participants
  const payerInParticipants = this.participants.some(
    p => p.userId.toString() === this.payerId.toString()
  );
  
  return payerInParticipants ? this.participants.length : this.participants.length + 1;
};

module.exports = mongoose.model('Transaction', TransactionSchema);