const express = require('express');
const multer = require('multer');
const { getProfile, updateProfile, uploadAvatar, deleteAvatar } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { updateProfileValidation } = require('../validation/userValidation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All user routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/me', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);

// Avatar routes - now supports file upload
router.put('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);

module.exports = router;