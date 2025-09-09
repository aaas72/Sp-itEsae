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
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', { errors })
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(
      createErrorResponse('DUPLICATE_RESOURCE', `${field} already exists`)
    );
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid ID format')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      createErrorResponse('AUTHENTICATION_FAILED', 'Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      createErrorResponse('AUTHENTICATION_FAILED', 'Token expired')
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json(
    createErrorResponse('INTERNAL_ERROR', message)
  );
};

module.exports = errorHandler;