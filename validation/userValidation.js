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
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'string.empty': 'Name cannot be empty'
    }),
  
  avatar: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Avatar must be a string'
    })
});

// Upload avatar validation schema
const uploadAvatarSchema = Joi.object({
  avatar: Joi.string()
    .required()
    .pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)
    .messages({
      'any.required': 'Avatar data is required',
      'string.pattern.base': 'Avatar must be a valid base64 image (jpeg, jpg, png, gif, webp)'
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