const { logActivity } = require('../controllers/activityController');
const colors = require('colors');

/**
 * Activity Logger Middleware - لتسجيل الأنشطة تلقائياً
 */

/**
 * Middleware لتسجيل أنشطة API تلقائياً
 */
const autoLogActivity = (activityConfig) => {
  return async (req, res, next) => {
    // حفظ الاستجابة الأصلية
    const originalSend = res.send;
    const originalJson = res.json;

    // تعديل دالة الاستجابة لتسجيل النشاط عند النجاح
    const logActivityOnSuccess = async (data) => {
      // التحقق من نجاح العملية (status code 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // استخراج البيانات المطلوبة من الطلب والاستجابة
          const activityData = await extractActivityData(req, res, data, activityConfig);
          
          if (activityData) {
            await logActivity(activityData);
            console.log('✅ [AUTO-ACTIVITY]'.green + ` Activity logged: ${activityData.type}`);
          }
        } catch (error) {
          console.error('⚠️ [AUTO-ACTIVITY]'.yellow + ' Failed to auto-log activity:', error.message);
        }
      }
    };

    // تعديل res.send
    res.send = function(data) {
      logActivityOnSuccess(data).finally(() => {
        originalSend.call(this, data);
      });
    };

    // تعديل res.json
    res.json = function(data) {
      logActivityOnSuccess(data).finally(() => {
        originalJson.call(this, data);
      });
    };

    next();
  };
};

/**
 * استخراج بيانات النشاط من الطلب والاستجابة
 */
const extractActivityData = async (req, res, responseData, config) => {
  try {
    const { type, getGroupId, getDescription, getMetadata, isImportant = false } = config;
    
    // الحصول على معرف المجموعة
    const groupId = typeof getGroupId === 'function' 
      ? await getGroupId(req, res, responseData)
      : req.params.groupId || req.body.groupId;

    if (!groupId) {
      console.warn('⚠️ [AUTO-ACTIVITY]'.yellow + ' No groupId found, skipping activity log');
      return null;
    }

    // الحصول على الوصف
    const description = typeof getDescription === 'function'
      ? await getDescription(req, res, responseData)
      : `${type} işlemi gerçekleştirildi`;

    // الحصول على البيانات الإضافية
    const metadata = typeof getMetadata === 'function'
      ? await getMetadata(req, res, responseData)
      : {};

    return {
      groupId,
      type,
      performedBy: req.user?.id,
      targetUser: req.params.userId || req.body.targetUser,
      relatedId: extractRelatedId(req, res, responseData),
      relatedType: extractRelatedType(req, res, responseData),
      description,
      metadata: {
        ...metadata,
        method: req.method,
        endpoint: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      },
      isImportant
    };
  } catch (error) {
    console.error('❌ [AUTO-ACTIVITY]'.red + ' Error extracting activity data:', error.message);
    return null;
  }
};

/**
 * استخراج معرف العنصر المرتبط
 */
const extractRelatedId = (req, res, responseData) => {
  // محاولة استخراج المعرف من الاستجابة
  if (responseData && typeof responseData === 'object') {
    const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
    
    if (parsed.data) {
      return parsed.data._id || parsed.data.id;
    }
  }
  
  // محاولة استخراج المعرف من المعاملات
  return req.params.id || req.params.transactionId || req.params.debtId || req.body.id;
};

/**
 * استخراج نوع العنصر المرتبط
 */
const extractRelatedType = (req, res, responseData) => {
  const url = req.originalUrl.toLowerCase();
  
  if (url.includes('/transactions')) return 'expense';
  if (url.includes('/debts')) return 'payment';
  if (url.includes('/groups')) return 'group';
  if (url.includes('/users')) return 'user';
  if (url.includes('/invitations')) return 'invitation';
  
  return null;
};

/**
 * Middleware محدد لأنشطة المجموعات
 */
const logGroupActivity = {
  // إنشاء مجموعة
  groupCreated: autoLogActivity({
    type: 'group_created',
    getGroupId: (req, res, data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed.data?._id;
    },
    getDescription: (req, res, data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return `"${parsed.data?.name}" grubu oluşturuldu`;
    },
    getMetadata: (req, res, data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        groupName: parsed.data?.name,
        currency: parsed.data?.currency,
        membersCount: parsed.data?.members?.length || 1
      };
    },
    isImportant: true
  }),

  // تحديث مجموعة
  groupUpdated: autoLogActivity({
    type: 'group_updated',
    getDescription: (req) => `Grup ayarları güncellendi`,
    getMetadata: (req) => ({
      updatedFields: Object.keys(req.body),
      changes: req.body
    })
  })
};

/**
 * Middleware محدد لأنشطة المعاملات
 */
const logTransactionActivity = {
  // إضافة مصروف
  expenseAdded: autoLogActivity({
    type: 'expense_added',
    getDescription: (req, res, data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return `Harcama eklendi: ${req.body.description}`;
    },
    getMetadata: (req, res, data) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        amount: req.body.amount,
        currency: req.body.currency,
        participantsCount: req.body.participants?.length,
        splitAmount: parsed.data?.splitAmount,
        debtsCreated: parsed.data?.debtsCreated
      };
    },
    isImportant: true
  }),

  // تحديث معاملة
  expenseUpdated: autoLogActivity({
    type: 'expense_updated',
    getDescription: (req) => `Harcama güncellendi: ${req.body.description || 'Belirtilmedi'}`,
    getMetadata: (req) => ({
      updatedFields: Object.keys(req.body),
      changes: req.body
    })
  }),

  // حذف معاملة
  expenseDeleted: autoLogActivity({
    type: 'expense_deleted',
    getDescription: (req) => `Harcama silindi`,
    getMetadata: (req) => ({
      deletedTransactionId: req.params.transactionId
    }),
    isImportant: true
  })
};

/**
 * Middleware محدد لأنشطة الديون
 */
const logDebtActivity = {
  // دفع دين
  paymentMade: autoLogActivity({
    type: 'payment_made',
    getDescription: (req, res, data) => {
      return `${req.body.amount} ${req.body.currency || 'TRY'} ödeme yapıldı`;
    },
    getMetadata: (req, res, data) => ({
      amount: req.body.amount,
      currency: req.body.currency,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes
    }),
    isImportant: true
  }),

  // تسوية دين
  debtSettled: autoLogActivity({
    type: 'settlement_completed',
    getDescription: (req) => `Borç kapatıldı`,
    getMetadata: (req) => ({
      settledDebtId: req.params.debtId,
      settlementType: req.body.settlementType
    }),
    isImportant: true
  })
};

/**
 * Middleware محدد لأنشطة الأعضاء
 */
const logMemberActivity = {
  // انضمام عضو
  memberJoined: autoLogActivity({
    type: 'member_joined',
    getDescription: (req, res, data) => {
      return `Yeni üye gruba katıldı`;
    },
    getMetadata: (req, res, data) => ({
      newMemberId: req.user?.id,
      role: req.body.role || 'member',
      invitedBy: req.body.invitedBy
    }),
    isImportant: true
  }),

  // مغادرة عضو
  memberLeft: autoLogActivity({
    type: 'member_left',
    getDescription: (req) => `Bir üye gruptan ayrıldı`,
    getMetadata: (req) => ({
      leftMemberId: req.user?.id
    }),
    isImportant: true
  }),

  // إزالة عضو
  memberRemoved: autoLogActivity({
    type: 'member_removed',
    getDescription: (req) => `Bir üye gruptan çıkarıldı`,
    getMetadata: (req) => ({
      removedMemberId: req.params.userId,
      removedBy: req.user?.id
    }),
    isImportant: true
  })
};

module.exports = {
  autoLogActivity,
  logGroupActivity,
  logTransactionActivity,
  logDebtActivity,
  logMemberActivity
};