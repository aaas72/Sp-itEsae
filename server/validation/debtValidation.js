const Joi = require('joi');
const mongoose = require('mongoose');

// THIS IS THE MISSING FUNCTION
// التحقق من صحة ObjectId
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value; // Return the valid value
};

// مخطط إنشاء مصروف جديد وتقسيمه
const createExpenseSchema = Joi.object({
  groupId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId') // Now this will work
    .required()
    .messages({
      'any.required': 'Grup kimliği gereklidir',
      'string.empty': 'Grup kimliği boş olamaz',
      'any.invalid': 'Geçersiz grup kimliği biçimi'
    }),
  
  participants: Joi.array()
    .items(Joi.string().custom(validateObjectId, 'Valid ObjectId')) // And this
    .min(1)
    .required()
    .messages({
      'any.required': 'Katılımcılar gereklidir',
      'array.min': 'En az bir katılımcı gereklidir',
      'array.base': 'Katılımcılar kullanıcı kimlikleri dizisi olmalıdır',
      'any.invalid': 'Katılımcı kimliklerinden biri geçersiz'
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Tutar gereklidir',
      'number.base': 'Tutar bir sayı olmalıdır',
      'number.positive': 'Tutar pozitif olmalıdır'
    }),

  description: Joi.string()
    .required()
    .trim()
    .max(200)
    .messages({
      'any.required': 'Açıklama gereklidir',
      'string.empty': 'Açıklama boş olamaz',
      'string.max': 'Açıklama 200 karakteri aşamaz'
    }),
    
  currency: Joi.string()
    .valid('USD', 'EUR', 'SAR', 'AED', 'EGP', 'TRY')
    .default('SAR')
    .messages({
      'any.only': 'Para birimi USD, EUR, SAR, AED, EGP, TRY\'den biri olmalıdır'
    })
});

// مخطط معلمة معرف الدين
const debtIdParamSchema = Joi.object({
  debtId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Borç kimliği gereklidir',
      'string.empty': 'Borç kimliği boş olamaz',
      'any.invalid': 'Geçersiz borç kimliği biçimi'
    })
});

// مخطط معلمة معرف المجموعة
const groupIdParamSchema = Joi.object({
  groupId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Grup kimliği gereklidir',
      'string.empty': 'Grup kimliği boş olamaz',
      'any.invalid': 'Geçersiz grup kimliği biçimi'
    })
});

// مخطط معلمات حساب الرصيد بين مستخدمين
const userBalanceParamSchema = Joi.object({
  groupId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Grup kimliği gereklidir',
      'string.empty': 'Grup kimliği boş olamaz',
      'any.invalid': 'Geçersiz grup kimliği biçimi'
    }),
  userId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Kullanıcı kimliği gereklidir',
      'string.empty': 'Kullanıcı kimliği boş olamaz',
      'any.invalid': 'Geçersiz kullanıcı kimliği biçimi'
    })
});

module.exports = {
  createExpenseSchema,
  debtIdParamSchema,
  groupIdParamSchema,
  userBalanceParamSchema
};