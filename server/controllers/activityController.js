const Activity = require('../models/Activity');
const Group = require('../models/Group');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');

/**
 * Activity Controller - للتعامل مع أنشطة المجموعة
 */

/**
 * الحصول على أنشطة المجموعة
 * GET /api/activities/group/:groupId
 */
exports.getGroupActivities = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;

    // التحقق من أن المستخدم عضو في المجموعة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı'));
    }

    const isMember = group.members.some(member => 
      member.userId.toString() === userId && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu grubun üyesi değilsiniz'));
    }

    // الحصول على الأنشطة
    const activities = await Activity.getGroupActivities(
      groupId, 
      parseInt(page), 
      parseInt(limit), 
      type
    );

    // حساب العدد الإجمالي
    const query = { groupId, status: 'active' };
    if (type) query.type = type;
    const totalCount = await Activity.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(createSuccessResponse({
      activities: activities.map(activity => activity.toActivityJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Etkinlikler başarıyla getirildi'));

  } catch (error) {
    console.error('Error getting group activities:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlikler getirilemedi'));
  }
};

/**
 * الحصول على أنشطة المستخدم
 * GET /api/activities/user
 */
exports.getUserActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // الحصول على أنشطة المستخدم
    const activities = await Activity.getUserActivities(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    // حساب العدد الإجمالي
    const totalCount = await Activity.countDocuments({
      $or: [
        { performedBy: userId },
        { targetUser: userId }
      ],
      status: 'active'
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json(createSuccessResponse({
      activities: activities.map(activity => activity.toActivityJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, 'Kullanıcı etkinlikleri başarıyla getirildi'));

  } catch (error) {
    console.error('Error getting user activities:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Kullanıcı etkinlikleri getirilemedi'));
  }
};

/**
 * الحصول على نشاط محدد
 * GET /api/activities/:activityId
 */
exports.getActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId)
      .populate('performedBy', 'name email avatar')
      .populate('targetUser', 'name email avatar')
      .populate('groupId', 'name');

    if (!activity) {
      return res.status(404).json(createErrorResponse('ACTIVITY_NOT_FOUND', 'Etkinlik bulunamadı'));
    }

    // التحقق من أن المستخدم له صلاحية رؤية النشاط
    const group = await Group.findById(activity.groupId);
    const isMember = group.members.some(member => 
      member.userId.toString() === userId && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu etkinliği görüntüleme yetkiniz yok'));
    }

    return res.status(200).json(createSuccessResponse({
      activity: activity.toActivityJSON()
    }, 'Etkinlik başarıyla getirildi'));

  } catch (error) {
    console.error('Error getting activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik getirilemedi'));
  }
};

/**
 * إنشاء نشاط جديد
 * POST /api/activities
 */
exports.createActivity = async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Doğrulama başarısız', errors.array()));
    }

    const {
      groupId,
      type,
      targetUser,
      relatedId,
      relatedType,
      description,
      metadata,
      isImportant = false
    } = req.body;

    const performedBy = req.user.id;

    // التحقق من وجود المجموعة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı'));
    }

    // التحقق من أن المستخدم عضو في المجموعة
    const isMember = group.members.some(member => 
      member.userId.toString() === performedBy && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu grubun üyesi değilsiniz'));
    }

    // إنشاء النشاط
    const activity = await Activity.createActivity({
      groupId,
      type,
      performedBy,
      targetUser,
      relatedId,
      relatedType,
      description,
      metadata,
      isImportant
    });

    // تحميل البيانات المرتبطة
    await activity.populate([
      { path: 'performedBy', select: 'name email avatar' },
      { path: 'targetUser', select: 'name email avatar' },
      { path: 'groupId', select: 'name' }
    ]);

    return res.status(201).json(createSuccessResponse({
      activity: activity.toActivityJSON()
    }, 'Etkinlik başarıyla oluşturuldu'));

  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik oluşturulamadı'));
  }
};

/**
 * تحديث نشاط
 * PUT /api/activities/:activityId
 */
exports.updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json(createErrorResponse('ACTIVITY_NOT_FOUND', 'Etkinlik bulunamadı'));
    }

    // التحقق من أن المستخدم هو من أنشأ النشاط أو مدير المجموعة
    const group = await Group.findById(activity.groupId);
    const isOwner = activity.performedBy.toString() === userId;
    const isAdmin = group.createdBy.toString() === userId;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu etkinliği güncelleme yetkiniz yok'));
    }

    // تحديث النشاط
    const updatedActivity = await activity.updateActivity(updateData);
    
    await updatedActivity.populate([
      { path: 'performedBy', select: 'name email avatar' },
      { path: 'targetUser', select: 'name email avatar' },
      { path: 'groupId', select: 'name' }
    ]);

    return res.status(200).json(createSuccessResponse({
      activity: updatedActivity.toActivityJSON()
    }, 'Etkinlik başarıyla güncellendi'));

  } catch (error) {
    console.error('Error updating activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik güncellenemedi'));
  }
};

/**
 * حذف نشاط (soft delete)
 * DELETE /api/activities/:activityId
 */
exports.deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json(createErrorResponse('ACTIVITY_NOT_FOUND', 'Etkinlik bulunamadı'));
    }

    // التحقق من أن المستخدم هو من أنشأ النشاط أو مدير المجموعة
    const group = await Group.findById(activity.groupId);
    const isOwner = activity.performedBy.toString() === userId;
    const isAdmin = group.createdBy.toString() === userId;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu etkinliği silme yetkiniz yok'));
    }

    // حذف النشاط (soft delete)
    await activity.softDelete();

    return res.status(200).json(createSuccessResponse(null, 'Etkinlik başarıyla silindi'));

  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik silinemedi'));
  }
};

/**
 * أرشفة نشاط
 * POST /api/activities/:activityId/archive
 */
exports.archiveActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json(createErrorResponse('ACTIVITY_NOT_FOUND', 'Etkinlik bulunamadı'));
    }

    // التحقق من أن المستخدم مدير المجموعة
    const group = await Group.findById(activity.groupId);
    const isAdmin = group.createdBy.toString() === userId;
    
    if (!isAdmin) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu etkinliği arşivleme yetkiniz yok'));
    }

    // أرشفة النشاط
    await activity.archive();

    return res.status(200).json(createSuccessResponse(null, 'Etkinlik başarıyla arşivlendi'));

  } catch (error) {
    console.error('Error archiving activity:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik arşivlenemedi'));
  }
};

/**
 * الحصول على إحصائيات الأنشطة
 * GET /api/activities/group/:groupId/stats
 */
exports.getActivityStats = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // التحقق من أن المستخدم عضو في المجموعة
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(createErrorResponse('GROUP_NOT_FOUND', 'Grup bulunamadı'));
    }

    const isMember = group.members.some(member => 
      member.userId.toString() === userId && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json(createErrorResponse('ACCESS_DENIED', 'Bu grubun üyesi değilsiniz'));
    }

    // حساب الإحصائيات
    const stats = await Activity.aggregate([
      {
        $match: {
          groupId: group._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // حساب العدد الإجمالي
    const totalActivities = await Activity.countDocuments({
      groupId,
      status: 'active'
    });

    // حساب الأنشطة في آخر 7 أيام
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentActivities = await Activity.countDocuments({
      groupId,
      status: 'active',
      createdAt: { $gte: weekAgo }
    });

    return res.status(200).json(createSuccessResponse({
      totalActivities,
      recentActivities,
      activityTypes: stats,
      period: {
        from: weekAgo,
        to: new Date()
      }
    }, 'Etkinlik istatistikleri başarıyla getirildi'));

  } catch (error) {
    console.error('Error getting activity stats:', error);
    return res.status(500).json(createErrorResponse('SERVER_ERROR', 'Etkinlik istatistikleri getirilemedi'));
  }
};

/**
 * Helper function لإنشاء نشاط تلقائياً
 */
exports.logActivity = async (activityData) => {
  try {
    const activity = await Activity.createActivity(activityData);
    console.log(`✅ Activity logged: ${activity.type} in group ${activity.groupId}`);
    return activity;
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    throw error;
  }
};