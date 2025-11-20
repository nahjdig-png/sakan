require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/database');
const { securityHeaders, corsOptions, requestLogger } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startCronJobs } = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(securityHeaders());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/buildings', require('./routes/buildings'));
app.use('/api/v1/units', require('./routes/units'));
app.use('/api/v1/invoices', require('./routes/invoices'));
app.use('/api/v1/subscriptions', require('./routes/subscriptions'));
app.use('/api/v1/customers', require('./routes/customers'));
app.use('/api/v1/users', require('./routes/users'));

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start cron jobs for notifications
  if (process.env.NODE_ENV !== 'test') {
    startCronJobs();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
