const ApiError = require('../utils/apiError');

const sendErrorDev = (error, res) =>
  res.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack,
  });

const handleJWTError = () =>
  new ApiError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new ApiError('Your token has been expired. Please log in again!', 401);

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new ApiError(message, 400);
};

const sendErrorProd = (error, res) =>
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);

    sendErrorProd(err, res);
  }
};
