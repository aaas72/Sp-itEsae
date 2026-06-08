const User = require('../models/User');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');
const colors = require('colors');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getProfile = async (req, res) => {
  try {
    console.log('👤 [USER]'.cyan + ' Get profile request for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    if (!user) {
      console.log('⚠️  [USER]'.yellow + ' User not found:', req.user.id);
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'Kullanıcı bulunamadı')
      );
    }

    console.log('✅ [USER]'.green + ' Profile retrieved successfully for:', user.email);

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
        }
      }, 'Profil başarıyla getirildi')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Get profile error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Profil getirilemedi', error.message)
    );
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    console.log('✏️  [USER]'.cyan + ' Update profile request for user:', req.user.id);
    
    const { name, avatar } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('⚠️  [USER]'.yellow + ' User not found:', req.user.id);
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'Kullanıcı bulunamadı')
      );
    }

    // Update fields if provided
    if (name !== undefined) {
      user.name = name;
    }
    
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Save updated user
    await user.save();

    console.log('✅ [USER]'.green + ' Profile updated successfully for:', user.email);

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
        }
      }, 'Profil başarıyla güncellendi')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Update profile error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Profil güncellenemedi', error.message)
    );
  }
};

/**
 * Upload user avatar (File Upload with Multer)
 * PUT /api/users/avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    console.log('📷 [USER]'.cyan + ' Upload avatar request for user:', req.user.id);
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Avatar dosyası gerekli')
      );
    }

    // Convert file buffer to base64
    const base64Avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('⚠️  [USER]'.yellow + ' User not found:', req.user.id);
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'Kullanıcı bulunamadı')
      );
    }

    // Store the base64 avatar
    user.avatar = base64Avatar;
    await user.save();

    console.log('✅ [USER]'.green + ' Avatar uploaded successfully for:', user.email);

    res.status(200).json(
      createSuccessResponse({
        avatar: user.avatar
      }, 'Avatar başarıyla yüklendi')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Upload avatar error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Avatar yüklenemedi', error.message)
    );
  }
};

/**
 * Delete user avatar
 * DELETE /api/users/avatar
 */
const deleteAvatar = async (req, res) => {
  try {
    console.log('🗑️  [USER]'.cyan + ' Delete avatar request for user:', req.user.id);
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('⚠️  [USER]'.yellow + ' User not found:', req.user.id);
      return res.status(404).json(
        createErrorResponse('USER_NOT_FOUND', 'Kullanıcı bulunamadı')
      );
    }

    // Remove avatar
    user.avatar = null;
    await user.save();

    console.log('✅ [USER]'.green + ' Avatar deleted successfully for:', user.email);

    res.status(200).json(
      createSuccessResponse({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      }, 'Avatar başarıyla silindi')
    );

  } catch (error) {
    console.error('💥 [ERROR]'.red + ' Delete avatar error:', error.message);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', 'Avatar silinemedi', error.message)
    );
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar
};