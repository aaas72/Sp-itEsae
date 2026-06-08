const express = require('express');
const { body, param, query } = require('express-validator');
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * Activity Routes - توجيه طلبات الأنشطة
 */

// Validation middleware
const validateActivityCreation = [
  body('groupId')
    .isMongoId()
    .withMessage('Group ID must be a valid MongoDB ObjectId'),
  body('type')
    .isIn([
      'member_joined', 'member_left', 'member_removed',
      'expense_added', 'expense_updated', 'expense_deleted',
      'payment_made', 'payment_received',
      'group_created', 'group_updated', 'group_deleted',
      'settlement_completed', 'debt_forgiven',
      'invitation_sent', 'invitation_accepted', 'invitation_declined'
    ])
    .withMessage('Invalid activity type'),
  body('targetUser')
    .optional()
    .isMongoId()
    .withMessage('Target user must be a valid MongoDB ObjectId'),
  body('relatedId')
    .optional()
    .isMongoId()
    .withMessage('Related ID must be a valid MongoDB ObjectId'),
  body('relatedType')
    .optional()
    .isIn(['expense', 'payment', 'group', 'user', 'invitation'])
    .withMessage('Invalid related type'),
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
];

const validateActivityUpdate = [
  body('description')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
];

const validateMongoId = [
  param('activityId')
    .isMongoId()
    .withMessage('Activity ID must be a valid MongoDB ObjectId')
];

const validateGroupId = [
  param('groupId')
    .isMongoId()
    .withMessage('Group ID must be a valid MongoDB ObjectId')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn([
      'member_joined', 'member_left', 'member_removed',
      'expense_added', 'expense_updated', 'expense_deleted',
      'payment_made', 'payment_received',
      'group_created', 'group_updated', 'group_deleted',
      'settlement_completed', 'debt_forgiven',
      'invitation_sent', 'invitation_accepted', 'invitation_declined'
    ])
    .withMessage('Invalid activity type filter')
];

/**
 * @route   GET /api/activities/group/:groupId
 * @desc    الحصول على أنشطة المجموعة
 * @access  Private (Group Members)
 */
router.get(
  '/group/:groupId',
  auth,
  validateGroupId,
  validatePagination,
  activityController.getGroupActivities
);

/**
 * @route   GET /api/activities/user
 * @desc    الحصول على أنشطة المستخدم
 * @access  Private
 */
router.get(
  '/user',
  auth,
  validatePagination,
  activityController.getUserActivities
);

/**
 * @route   GET /api/activities/:activityId
 * @desc    الحصول على نشاط محدد
 * @access  Private (Group Members)
 */
router.get(
  '/:activityId',
  auth,
  validateMongoId,
  activityController.getActivity
);

/**
 * @route   POST /api/activities
 * @desc    إنشاء نشاط جديد
 * @access  Private (Group Members)
 */
router.post(
  '/',
  auth,
  validateActivityCreation,
  activityController.createActivity
);

/**
 * @route   PUT /api/activities/:activityId
 * @desc    تحديث نشاط
 * @access  Private (Activity Owner or Group Admin)
 */
router.put(
  '/:activityId',
  auth,
  validateMongoId,
  validateActivityUpdate,
  activityController.updateActivity
);

/**
 * @route   DELETE /api/activities/:activityId
 * @desc    حذف نشاط (soft delete)
 * @access  Private (Activity Owner or Group Admin)
 */
router.delete(
  '/:activityId',
  auth,
  validateMongoId,
  activityController.deleteActivity
);

/**
 * @route   POST /api/activities/:activityId/archive
 * @desc    أرشفة نشاط
 * @access  Private (Group Admin)
 */
router.post(
  '/:activityId/archive',
  auth,
  validateMongoId,
  activityController.archiveActivity
);

/**
 * @route   GET /api/activities/group/:groupId/stats
 * @desc    الحصول على إحصائيات الأنشطة
 * @access  Private (Group Members)
 */
router.get(
  '/group/:groupId/stats',
  auth,
  validateGroupId,
  activityController.getActivityStats
);

module.exports = router;