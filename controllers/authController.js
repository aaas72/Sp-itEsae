const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenHelper');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');
const { registerValidation, loginValidation, refreshTokenValidation } = require('../validation/authValidation');
const colors = require('colors');

const register = async (req, res) => {
  try {
    console.log('🔐 [AUTH]'.cyan + ' Registration attempt for:', req.body.email);
    
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      console.log('❌ [VALIDATION]'.red + ' Registration validation failed:', error.details[0].message);
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', error.details[0].message)
      );
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  [AUTH]'.yellow + ' Registration failed - User already exists:', email);
      return res.status(409).json(
        createErrorResponse('USER_EXISTS', 'User with this email already exists')
      );
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    await user.addRefreshToken(refreshToken);

    console.log('✅ [AUTH]'.green + ' User registered successfully:', email);

    res.status(201).json(
      createSuccessResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'User registered successfully')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Registration error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Registration failed', error.message)
    );
  }
};


const login = async (req, res) => {
  try {
    console.log('🔐 [AUTH]'.cyan + ' Login attempt for:', req.body.email);
    
    // Validate input
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      console.log('❌ [VALIDATION]'.red + ' Login validation failed:', error.details[0].message);
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', error.details[0].message)
      );
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('⚠️  [AUTH]'.yellow + ' Login failed - User not found:', email);
      return res.status(401).json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('⚠️  [AUTH]'.yellow + ' Login failed - User inactive:', email);
      return res.status(401).json(
        createErrorResponse('USER_INACTIVE', 'User account is inactive')
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('⚠️  [AUTH]'.yellow + ' Login failed - Invalid password:', email);
      return res.status(401).json(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    await user.addRefreshToken(refreshToken);

    console.log('✅ [AUTH]'.green + ' User logged in successfully:', email);

    res.status(200).json(
      createSuccessResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }, 'Login successful')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Login error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Login failed', error.message)
    );
  }
};

const refreshToken = async (req, res) => {
  try {
    console.log('🔄 [AUTH]'.cyan + ' Token refresh attempt');
    // Validate input
    const { error, value } = refreshTokenValidation.validate(req.body);
    if (error) {
      console.log('❌ [VALIDATION]'.red + ' Refresh token validation failed:', error.details[0].message);
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', error.details[0].message)
      );
    }
    const { refreshToken: token } = value;

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (tokenError) {
      console.log('⚠️  [AUTH]'.yellow + ' Invalid refresh token:', tokenError.message);
      return res.status(401).json(
        createErrorResponse('INVALID_TOKEN', 'Invalid or expired refresh token')
      );
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('⚠️  [AUTH]'.yellow + ' User not found for refresh token');
      return res.status(401).json(
        createErrorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === token);
    if (!tokenExists) {
      console.log('⚠️  [AUTH]'.yellow + ' Refresh token not found in user tokens');
      return res.status(401).json(
        createErrorResponse('INVALID_TOKEN', 'Invalid refresh token')
      );
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('⚠️  [AUTH]'.yellow + ' Token refresh failed - User inactive');
      return res.status(401).json(
        createErrorResponse('USER_INACTIVE', 'User account is inactive')
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    console.log('✅ [AUTH]'.green + ' Token refreshed successfully for user:', user.email);

    res.status(200).json(
      createSuccessResponse({
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isActive: user.isActive
        }
      }, 'Token refreshed successfully')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Token refresh error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Token refresh failed', error.message)
    );
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    console.log('🚪 [AUTH]'.cyan + ' Logout attempt for user:', req.user.id);
    
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('⚠️  [AUTH]'.yellow + ' User not found for logout');
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'User not found')
      );
    }

    // Remove specific refresh token if provided, otherwise clear all
    if (token) {
      await user.removeRefreshToken(token);
      console.log('✅ [AUTH]'.green + ' Specific refresh token removed for user:', user.email);
    } else {
      await user.clearRefreshTokens();
      console.log('✅ [AUTH]'.green + ' All refresh tokens cleared for user:', user.email);
    }

    res.status(200).json(
      createSuccessResponse(null, 'Logout successful')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Logout error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Logout failed', error.message)
    );
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};