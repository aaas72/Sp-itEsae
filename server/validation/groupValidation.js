const Joi = require('joi');
const { createErrorResponse } = require('../utils/responseHelper');

// Create group validation schema
const createGroupSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'any.required': 'Grup adı gereklidir',
      'string.min': 'Grup adı en az 2 karakter uzunluğunda olmalıdır',
      'string.max': 'Grup adı 50 karakteri aşamaz',
      'string.empty': 'Grup adı boş olamaz'
    }),
  
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Açıklama 200 karakteri aşamaz'
    }),
  
  category: Joi.string()
    .valid('family', 'friends', 'travel', 'work', 'other')
    .optional()
    .default('other')
    .messages({
      'any.only': 'Kategori şunlardan biri olmalıdır: aile, arkadaşlar, seyahat, iş, diğer'
    })
});

// Update group validation schema
const updateGroupSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Grup adı en az 2 karakter uzunluğunda olmalıdır',
      'string.max': 'Grup adı 50 karakteri aşamaz',
      'string.empty': 'Grup adı boş olamaz'
    }),
  
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Açıklama 200 karakteri aşamaz'
    }),
  
  category: Joi.string()
    .valid('family', 'friends', 'travel', 'work', 'other')
    .optional()
    .messages({
      'any.only': 'Kategori şunlardan biri olmalıdır: aile, arkadaşlar, seyahat, iş, diğer'
    })
});

// Invite user validation schema
const inviteUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'E-posta gereklidir',
      'string.email': 'Lütfen geçerli bir e-posta adresi girin'
    }),
  
  role: Joi.string()
    .valid('admin', 'member')
    .optional()
    .default('member')
    .messages({
      'any.only': 'Rol yönetici veya üye olmalıdır'
    })
});

// Accept invitation validation schema
const acceptInvitationSchema = Joi.object({
  invitationId: Joi.string()
    .required()
    .messages({
      'any.required': 'Davetiye kimliği gereklidir',
      'string.empty': 'Davetiye kimliği boş olamaz'
    })
});

// Reject invitation validation schema
const rejectInvitationSchema = Joi.object({
  invitationId: Joi.string()
    .required()
    .messages({
      'any.required': 'Davetiye kimliği gereklidir',
      'string.empty': 'Davetiye kimliği boş olamaz'
    })
});

// Update member role validation schema
const updateMemberRoleSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'Kullanıcı kimliği gereklidir',
      'string.empty': 'Kullanıcı kimliği boş olamaz'
    }),
  
  role: Joi.string()
    .valid('admin', 'member')
    .required()
    .messages({
      'any.required': 'Rol gereklidir',
      'any.only': 'Rol yönetici veya üye olmalıdır'
    })
});

// Remove member validation schema
const removeMemberSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'Kullanıcı kimliği gereklidir',
      'string.empty': 'Kullanıcı kimliği boş olamaz'
    })
});

// Middleware functions
const createGroupValidation = (req, res, next) => {
  const { error, value } = createGroupSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const updateGroupValidation = (req, res, next) => {
  const { error, value } = updateGroupSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const inviteUserValidation = (req, res, next) => {
  const { error, value } = inviteUserSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const acceptInvitationValidation = (req, res, next) => {
  const { error, value } = acceptInvitationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const rejectInvitationValidation = (req, res, next) => {
  const { error, value } = rejectInvitationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const updateMemberRoleValidation = (req, res, next) => {
  const { error, value } = updateMemberRoleSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

const removeMemberValidation = (req, res, next) => {
  const { error, value } = removeMemberSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', error.details[0].message)
    );
  }
  
  req.body = value;
  next();
};

module.exports = {
  // Schemas
  createGroupSchema,
  updateGroupSchema,
  inviteUserSchema,
  acceptInvitationSchema,
  rejectInvitationSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  
  // Middleware functions
  createGroupValidation,
  updateGroupValidation,
  inviteUserValidation,
  acceptInvitationValidation,
  rejectInvitationValidation,
  updateMemberRoleValidation,
  removeMemberValidation
};