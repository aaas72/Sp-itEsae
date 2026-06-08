const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Activity Schema - لتتبع جميع أنشطة المجموعة
 */
const ActivitySchema = new Schema({
  // معرف المجموعة التي حدث فيها النشاط
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  
  // نوع النشاط
  type: {
    type: String,
    enum: [
      'member_joined',      // انضمام عضو جديد
      'member_left',        // مغادرة عضو
      'member_added',       // إضافة عضو من قبل مدير
      'member_removed',     // إزالة عضو من قبل مدير
      'transaction_added',  // إضافة معاملة جديدة
      'transaction_updated', // تحديث معاملة
      'transaction_deleted', // حذف معاملة
      'debt_added',         // إضافة دين جديد
      'debt_updated',       // تحديث دين
      'debt_settled',       // تسوية دين
      'debt_deleted',       // حذف دين
      'group_created',      // إنشاء المجموعة
      'group_updated',      // تحديث معلومات المجموعة
      'group_deleted',      // حذف المجموعة
      'invitation_sent',    // إرسال دعوة
      'invitation_accepted', // قبول دعوة
      'invitation_declined', // رفض دعوة
      'payment_made',       // دفع مبلغ
      'expense_split'       // تقسيم مصروف
    ],
    required: true
  },
  
  // المستخدم الذي قام بالنشاط
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // المستخدم المتأثر بالنشاط (اختياري)
  targetUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // معرف الكائن المرتبط بالنشاط (معاملة، دين، إلخ)
  relatedId: {
    type: Schema.Types.ObjectId
  },
  
  // نوع الكائن المرتبط
  relatedType: {
    type: String,
    enum: ['Transaction', 'Debt', 'Group', 'Invitation', 'User']
  },
  
  // وصف النشاط
  description: {
    type: String,
    required: true
  },
  
  // تفاصيل إضافية للنشاط (JSON)
  metadata: {
    amount: Number,        // المبلغ (للمعاملات والديون)
    currency: String,      // العملة
    oldValue: Schema.Types.Mixed,  // القيمة القديمة (للتحديثات)
    newValue: Schema.Types.Mixed,  // القيمة الجديدة (للتحديثات)
    participants: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: Number
    }],
    category: String,      // فئة المعاملة
    notes: String         // ملاحظات إضافية
  },
  
  // حالة النشاط
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  
  // هل النشاط مهم (لإظهاره في الإشعارات)
  isImportant: {
    type: Boolean,
    default: false
  },
  
  // تاريخ الإنشاء
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // تاريخ التحديث
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Indexes للأداء الأفضل
 */
ActivitySchema.index({ groupId: 1, createdAt: -1 });
ActivitySchema.index({ performedBy: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, groupId: 1 });
ActivitySchema.index({ relatedId: 1, relatedType: 1 });

/**
 * Static Methods
 */

/**
 * الحصول على أنشطة المجموعة مع التصفح
 */
ActivitySchema.statics.getGroupActivities = function(groupId, page = 1, limit = 20, type = null) {
  const skip = (page - 1) * limit;
  
  const query = { 
    groupId, 
    status: 'active' 
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('performedBy', 'name email avatar')
    .populate('targetUser', 'name email avatar')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * الحصول على أنشطة المستخدم
 */
ActivitySchema.statics.getUserActivities = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { performedBy: userId },
      { targetUser: userId }
    ],
    status: 'active'
  })
    .populate('performedBy', 'name email avatar')
    .populate('targetUser', 'name email avatar')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * إنشاء نشاط جديد
 */
ActivitySchema.statics.createActivity = function(activityData) {
  return this.create({
    ...activityData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

/**
 * Instance Methods
 */

/**
 * تحديث النشاط
 */
ActivitySchema.methods.updateActivity = function(updateData) {
  Object.assign(this, updateData);
  this.updatedAt = new Date();
  return this.save();
};

/**
 * أرشفة النشاط
 */
ActivitySchema.methods.archive = function() {
  this.status = 'archived';
  this.updatedAt = new Date();
  return this.save();
};

/**
 * حذف النشاط (soft delete)
 */
ActivitySchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.updatedAt = new Date();
  return this.save();
};

/**
 * تحويل النشاط إلى JSON للعرض
 */
ActivitySchema.methods.toActivityJSON = function() {
  return {
    id: this._id,
    groupId: this.groupId,
    type: this.type,
    performedBy: this.performedBy,
    targetUser: this.targetUser,
    relatedId: this.relatedId,
    relatedType: this.relatedType,
    description: this.description,
    metadata: this.metadata,
    status: this.status,
    isImportant: this.isImportant,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Pre-save middleware
 */
ActivitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Activity', ActivitySchema);