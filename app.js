const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
// const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const projectRouter = require('./routes/projectRoutes');
const userRouter = require('./routes/userRoutes');
const timesheetRouter = require('./routes/timesheetRoutes');

const app = express();

// GLOBAL MIDDLEWARE

// Set CORS
app.use(cors());

// Set security HTTP Headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP to API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again later.',
});
app.use('/api', limiter);

// Body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitazation against NO SQL query injection
app.use(mongoSanitize());

// Data sanitazation against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: ['feeKZT', 'completion', 'serviceLine', 'department'],
//   })
// );

// Compress all text sent to Client
app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Serving static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle SPA
  // app.get(/.*/, (req, res) =>
  //   res.sendFile(path.join(__dirname, 'public/index.html'))
  // );
}

// ROUTES
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/timesheets', timesheetRouter);

// ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
