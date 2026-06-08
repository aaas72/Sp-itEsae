const { body, validationResult } = require('express-validator');
const { createErrorResponse } = require('../utils/responseHelper');
const mongoose = require('mongoose');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    console.log('❌ [Validation] Validation errors:', errorMessages);
    
    return res.status(400).json(
      createErrorResponse(
        'VALIDATION_ERROR',
        'Doğrulama başarısız',
        { errors: errorMessages }
      )
    );
  }
  next();
};

/**
 * Validate expense creation request
 */
const validateCreateExpense = [
  body('groupId')
    .notEmpty()
    .withMessage('Grup kimliği gereklidir')
    .isMongoId()
    .withMessage('Geçersiz grup kimliği biçimi'),
    
  body('amount')
    .notEmpty()
    .withMessage('Tutar gereklidir')
    .isFloat({ min: 0.01 })
    .withMessage('Tutar 0\'dan büyük pozitif bir sayı olmalıdır'),
    
  body('description')
    .notEmpty()
    .withMessage('Açıklama gereklidir')
    .isLength({ min: 1, max: 500 })
    .withMessage('Açıklama 1 ile 500 karakter arasında olmalıdır')
    .trim(),
    
  body('participants')
    .isArray({ min: 1 })
    .withMessage('En az bir katılımcı gereklidir')
    .custom((participants) => {
      // Check if all participants are valid MongoDB ObjectIds
      for (const participantId of participants) {
        if (!mongoose.Types.ObjectId.isValid(participantId)) {
          throw new Error(`Geçersiz katılımcı kimliği: ${participantId}`);
        }
      }
      
      // Check for duplicate participants
      const uniqueParticipants = [...new Set(participants)];
      if (uniqueParticipants.length !== participants.length) {
        throw new Error('Tekrarlanan katılımcılara izin verilmez');
      }
      
      return true;
    }),
    
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Para birimi 3 harfli bir kod olmalıdır')
    .isAlpha()
    .withMessage('Para birimi yalnızca harf içermelidir')
    .toUpperCase(),
    
  handleValidationErrors
];

/**
 * Validate group creation request
 */
const validateCreateGroup = [
  body('name')
    .notEmpty()
    .withMessage('Grup adı gereklidir')
    .isLength({ min: 1, max: 100 })
    .withMessage('Grup adı 1 ile 100 karakter arasında olmalıdır')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Açıklama 500 karakteri aşamaz')
    .trim(),
    
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Para birimi 3 harfli bir kod olmalıdır')
    .isAlpha()
    .withMessage('Para birimi yalnızca harf içermelidir')
    .toUpperCase(),
    
  handleValidationErrors
];

/**
 * Validate user registration request
 */
const validateUserRegistration = [
  body('name')
    .notEmpty()
    .withMessage('İsim gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2 ile 50 karakter arasında olmalıdır')
    .trim(),
    
  body('email')
    .notEmpty()
    .withMessage('E-posta gereklidir')
    .isEmail()
    .withMessage('Lütfen geçerli bir e-posta adresi girin')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter uzunluğunda olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir'),
    
  handleValidationErrors
];

/**
 * Validate user login request
 */
const validateUserLogin = [
  body('email')
    .notEmpty()
    .withMessage('E-posta gereklidir')
    .isEmail()
    .withMessage('Lütfen geçerli bir e-posta adresi girin')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Şifre gereklidir'),
    
  handleValidationErrors
];

/**
 * Validate debt settlement request
 */
const validateSettleDebt = [
  body('debtId')
    .notEmpty()
    .withMessage('Borç kimliği gereklidir')
    .isMongoId()
    .withMessage('Geçersiz borç kimliği biçimi'),
    
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Ödeme tutarı pozitif bir sayı olmalıdır'),
    
  handleValidationErrors
];

/**
 * Validate add group member request
 */
const validateAddGroupMember = [
  body('userId')
    .notEmpty()
    .withMessage('Kullanıcı kimliği gereklidir')
    .isMongoId()
    .withMessage('Geçersiz kullanıcı kimliği biçimi'),
    
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Rol yönetici veya üye olmalıdır'),
    
  handleValidationErrors
];

/**
 * Validate update profile request
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2 ile 50 karakter arasında olmalıdır')
    .trim(),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Lütfen geçerli bir e-posta adresi girin')
    .normalizeEmail(),
    
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Lütfen geçerli bir telefon numarası girin'),
    
  handleValidationErrors
];

module.exports = {
  validateCreateExpense,
  validateCreateGroup,
  validateUserRegistration,
  validateUserLogin,
  validateSettleDebt,
  validateAddGroupMember,
  validateUpdateProfile,
  handleValidationErrors
};