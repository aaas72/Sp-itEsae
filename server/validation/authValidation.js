const Joi = require('joi');

const registerValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'İsim en az 2 karakter uzunluğunda olmalıdır',
      'string.max': 'İsim 100 karakteri aşamaz',
      'any.required': 'İsim gereklidir'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi girin',
      'any.required': 'E-posta gereklidir'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Şifre en az 6 karakter uzunluğunda olmalıdır',
      'string.max': 'Şifre 128 karakteri aşamaz',
      'any.required': 'Şifre gereklidir'
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Şifre onayı şifre ile eşleşmelidir',
      'any.required': 'Şifre onayı gereklidir'
    })
});

const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Lütfen geçerli bir e-posta adresi girin',
      'any.required': 'E-posta gereklidir'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Şifre gereklidir'
    })
});

const refreshTokenValidation = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Yenileme tokeni gereklidir'
    })
});

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation
};