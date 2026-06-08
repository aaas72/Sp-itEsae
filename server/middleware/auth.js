const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createErrorResponse } = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        createErrorResponse('AUTHENTICATION_FAILED', 'Erişim tokeni gerekli')
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json(
        createErrorResponse('AUTHENTICATION_FAILED', 'Erişim tokeni gerekli')
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and exclude password
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json(
        createErrorResponse('AUTHENTICATION_FAILED', 'Geçersiz token veya kullanıcı bulunamadı')
      );
    }

    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        createErrorResponse('AUTHENTICATION_FAILED', 'Geçersiz token')
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        createErrorResponse('AUTHENTICATION_FAILED', 'Token süresi dolmuş')
      );
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Kimlik doğrulama hatası')
    );
  }
};

module.exports = authMiddleware;