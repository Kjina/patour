const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./helpers/appError');
const globalErrorHander = require('./controllers/errorController');

const app = express();

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HHTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 100,
  message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true }));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHander);

module.exports = app;
