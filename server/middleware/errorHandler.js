const { createErrorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Doğrulama başarısız', { errors })
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = field === 'email'
      ? 'Bu e-posta adresi zaten kullanımda'
      : `${field} zaten mevcut`;

    return res.status(409).json(
      createErrorResponse('DUPLICATE_RESOURCE', message, {
        errors: [{ field, message }]
      })
    );
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Geçersiz kimlik biçimi')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse('AUTHENTICATION_FAILED', 'Geçersiz token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse('AUTHENTICATION_FAILED', 'Token süresi dolmuş')
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası';
  
  res.status(statusCode).json(
    createErrorResponse('INTERNAL_ERROR', message)
  );
};

module.exports = errorHandler;