// ===================================
// 🚀 SPLITEASE API SERVER
// ===================================

// 1️⃣ تحميل متغيرات البيئة أولاً
require('dotenv').config({ path: './config/.env' });
require('colors');

// 2️⃣ استيراد المكتبات الأساسية
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// 3️⃣ استيراد الإعدادات والوسائط
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { createErrorResponse } = require('./utils/responseHelper');

// 4️⃣ استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const debtRoutes = require('./routes/debtRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // إضافة مسارات التحليلات
const transactionRoutes = require('./routes/transactionRoutes'); // إضافة مسارات المعاملات
const activityRoutes = require('./routes/activityRoutes'); // إضافة مسارات الأنشطة


// ===================================
// 🎨 CUSTOM LOGGER WITH COLORS
// ===================================
const logger = {
  info: (message) => console.log(`ℹ️  [INFO]`.cyan + ` ${message}`.white),
  success: (message) => console.log(`✅ [SUCCESS]`.green + ` ${message}`.white),
  warning: (message) => console.log(`⚠️  [WARNING]`.yellow + ` ${message}`.white),
  error: (message) => console.log(`❌ [ERROR]`.red + ` ${message}`.white),
  debug: (message) => console.log(`🐛 [DEBUG]`.magenta + ` ${message}`.white),
  server: (message) => console.log(`🚀 [SERVER]`.blue + ` ${message}`.white),
  database: (message) => console.log(`🗄️  [DATABASE]`.green + ` ${message}`.white),
  security: (message) => console.log(`🔒 [SECURITY]`.yellow + ` ${message}`.white)
};

// ===================================
// 🏁 APPLICATION STARTUP SEQUENCE
// ===================================

logger.server('🌟 Starting SplitEase API Server...');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`Port: ${process.env.PORT || 5000}`);

// 5️⃣ إنشاء تطبيق Express
const app = express();
logger.success('Express application initialized');

// ===================================
// 🔗 DATABASE CONNECTION
// ===================================

// الاتصال بقاعدة البيانات مع معالجة الأخطاء
const initializeDatabase = async () => {
  try {
    logger.database('Attempting to connect to MongoDB...');
    await connectDB();
    logger.success('✨ MongoDB connected successfully!');
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    logger.error('🔥 Shutting down server due to database connection failure');
    process.exit(1);
  }
};

// ===================================
// 🛡️ SECURITY MIDDLEWARE
// ===================================

logger.security('Setting up security middleware...');

// Helmet for security headers
app.use(helmet());
logger.success('Helmet security headers configured');

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL_PROD?.split(',') || ['https://yourdomain.com']
    : [
        'http://localhost:3000',     // React web app
        'http://localhost:19006',    // Expo web
        'http://localhost:8081',     // Expo Metro bundler
        'http://127.0.0.1:3000',     // Alternative localhost
        'http://127.0.0.1:19006',    // Alternative Expo web
        'http://127.0.0.1:8081',     // Alternative Metro bundler
        'exp://localhost:19000',     // Expo development server
        'exp://127.0.0.1:19000',     // Alternative Expo dev server
        'http://10.0.2.2:5000',      // Android emulator localhost
        'http://localhost:19000'     // Expo CLI server
      ],
  credentials: true
}));
logger.success('CORS policy configured'); 

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warning(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later'));
  }
});
app.use(limiter);
logger.success('Rate limiting configured');

// ===================================
// 📝 LOGGING MIDDLEWARE
// ===================================

// Custom Morgan format with colors
if (process.env.NODE_ENV !== 'production') {
  morgan.token('status', (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return status.toString().red;
    if (status >= 400) return status.toString().yellow;
    if (status >= 300) return status.toString().cyan;
    return status.toString().green;
  });
  
  morgan.token('method', (req) => {
    const method = req.method;
    switch (method) {
      case 'GET': return method.green;
      case 'POST': return method.blue;
      case 'PUT': return method.yellow;
      case 'DELETE': return method.red;
      default: return method.white;
    }
  });
  
  app.use(morgan('🌐 :method :url :status :response-time ms - :res[content-length]'));
  logger.success('HTTP request logging configured');
}

// ===================================
// 📦 BODY PARSING MIDDLEWARE
// ===================================

logger.info('Setting up body parsing middleware...');
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    logger.debug(`Received ${buf.length} bytes of JSON data`);
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));
logger.success('Body parsing middleware configured');

// ===================================
// 🛣️ API ROUTES
// ===================================

logger.info('Setting up API routes...');

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  const healthData = {
    success: true,
    message: 'Server is running smoothly! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  res.status(200).json(healthData);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/analytics', analyticsRoutes); // إضافة مسارات التحليلات
app.use('/api/transactions', transactionRoutes); // إضافة مسارات المعاملات
app.use('/api/activities', activityRoutes); // إضافة مسارات الأنشطة
logger.success('All API routes configured');

// ===================================
// 🚫 ERROR HANDLING
// ===================================

// Handle 404 routes
app.use('*', (req, res) => {
  logger.warning(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json(
    createErrorResponse('RESOURCE_NOT_FOUND', `Route ${req.originalUrl} not found`)
  );
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  logger.error(`Global error handler: ${err.message}`);
  errorHandler(err, req, res, next);
});

logger.success('Error handling middleware configured');

// ===================================
// 🚀 SERVER STARTUP
// ===================================

const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50).rainbow);
      logger.server(`🎉 SplitEase API Server is running!`);
      logger.server(`🌍 Server URL: http://localhost:${PORT}`);
      logger.server(`📊 Health Check: http://localhost:${PORT}/health`);
      logger.server(`🌍 Server URL: http://192.168.1.100:${PORT}`);
      logger.server(`📊 Health Check: http://192.168.1.100:${PORT}/health`);
      logger.server(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50).rainbow + '\n');
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.warning(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.success('HTTP server closed');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// ===================================
// 🔥 PROCESS ERROR HANDLERS
// ===================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  logger.error('🔥 Shutting down server due to unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error('🔥 Shutting down server due to uncaught exception');
  process.exit(1);
});

// ===================================
// 🎬 START THE SHOW!
// ===================================

startServer();