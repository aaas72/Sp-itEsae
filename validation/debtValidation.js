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
      'any.required': 'Group ID is required',
      'string.empty': 'Group ID cannot be empty',
      'any.invalid': 'Invalid Group ID format'
    }),
  
  participants: Joi.array()
    .items(Joi.string().custom(validateObjectId, 'Valid ObjectId')) // And this
    .min(1)
    .required()
    .messages({
      'any.required': 'Participants are required',
      'array.min': 'At least one participant is required',
      'array.base': 'Participants must be an array of user IDs',
      'any.invalid': 'One of the participant IDs is invalid'
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Amount is required',
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive'
    }),

  description: Joi.string()
    .required()
    .trim()
    .max(200)
    .messages({
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 200 characters'
    }),
    
  currency: Joi.string()
    .valid('USD', 'EUR', 'SAR', 'AED', 'EGP', 'TRY')
    .default('SAR')
    .messages({
      'any.only': 'Currency must be one of USD, EUR, SAR, AED, EGP, TRY'
    })
});

// مخطط معلمة معرف الدين
const debtIdParamSchema = Joi.object({
  debtId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Debt ID is required',
      'string.empty': 'Debt ID cannot be empty',
      'any.invalid': 'Invalid Debt ID format'
    })
});

// مخطط معلمة معرف المجموعة
const groupIdParamSchema = Joi.object({
  groupId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Group ID is required',
      'string.empty': 'Group ID cannot be empty',
      'any.invalid': 'Invalid Group ID format'
    })
});

// مخطط معلمات حساب الرصيد بين مستخدمين
const userBalanceParamSchema = Joi.object({
  groupId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'Group ID is required',
      'string.empty': 'Group ID cannot be empty',
      'any.invalid': 'Invalid Group ID format'
    }),
  userId: Joi.string()
    .custom(validateObjectId, 'Valid ObjectId')
    .required()
    .messages({
      'any.required': 'User ID is required',
      'string.empty': 'User ID cannot be empty',
      'any.invalid': 'Invalid User ID format'
    })
});

module.exports = {
  createExpenseSchema,
  debtIdParamSchema,
  groupIdParamSchema,
  userBalanceParamSchema
};