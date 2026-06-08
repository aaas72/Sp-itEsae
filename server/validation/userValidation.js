const Joi = require('joi');
const { createErrorResponse } = require('../utils/responseHelper');

// Update profile validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'İsim en az 2 karakter uzunluğunda olmalıdır',
      'string.max': 'İsim 50 karakteri aşamaz',
      'string.empty': 'İsim boş olamaz'
    }),
  
  avatar: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Avatar bir metin olmalıdır'
    })
});

// Upload avatar validation schema
const uploadAvatarSchema = Joi.object({
  avatar: Joi.string()
    .required()
    .pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)
    .messages({
      'any.required': 'Avatar verisi gereklidir',
      'string.pattern.base': 'Avatar geçerli bir base64 görüntü olmalıdır (jpeg, jpg, png, gif, webp)'
    })
});

// Middleware functions
const updateProfileValidation = (req, res, next) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const uploadAvatarValidation = (req, res, next) => {
  const { error, value } = uploadAvatarSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

module.exports = {
  updateProfileSchema,
  uploadAvatarSchema,
  updateProfileValidation,
  uploadAvatarValidation
};