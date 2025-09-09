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
      'any.required': 'Group name is required',
      'string.min': 'Group name must be at least 2 characters long',
      'string.max': 'Group name cannot exceed 50 characters',
      'string.empty': 'Group name cannot be empty'
    }),
  
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 200 characters'
    }),
  
  category: Joi.string()
    .valid('family', 'friends', 'travel', 'work', 'other')
    .optional()
    .default('other')
    .messages({
      'any.only': 'Category must be one of: family, friends, travel, work, other'
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
      'string.min': 'Group name must be at least 2 characters long',
      'string.max': 'Group name cannot exceed 50 characters',
      'string.empty': 'Group name cannot be empty'
    }),
  
  description: Joi.string()
    .max(200)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 200 characters'
    }),
  
  category: Joi.string()
    .valid('family', 'friends', 'travel', 'work', 'other')
    .optional()
    .messages({
      'any.only': 'Category must be one of: family, friends, travel, work, other'
    })
});

// Invite user validation schema
const inviteUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  
  role: Joi.string()
    .valid('admin', 'member')
    .optional()
    .default('member')
    .messages({
      'any.only': 'Role must be either admin or member'
    })
});

// Accept invitation validation schema
const acceptInvitationSchema = Joi.object({
  invitationId: Joi.string()
    .required()
    .messages({
      'any.required': 'Invitation ID is required',
      'string.empty': 'Invitation ID cannot be empty'
    })
});

// Reject invitation validation schema
const rejectInvitationSchema = Joi.object({
  invitationId: Joi.string()
    .required()
    .messages({
      'any.required': 'Invitation ID is required',
      'string.empty': 'Invitation ID cannot be empty'
    })
});

// Update member role validation schema
const updateMemberRoleSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required',
      'string.empty': 'User ID cannot be empty'
    }),
  
  role: Joi.string()
    .valid('admin', 'member')
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be either admin or member'
    })
});

// Remove member validation schema
const removeMemberSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required',
      'string.empty': 'User ID cannot be empty'
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