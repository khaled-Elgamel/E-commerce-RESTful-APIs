const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');

exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = createToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if email and password in the body ====> validtion file

  // 2- check if the user exists and password is correct
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError('Incorrect Email Or Password', 401));
  }

  // 3- generate Token
  const token = createToken(user._id);

  // 4- send response
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if the token exist , if exists get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new ApiError('You are not logged in! Please log in to get access', 403),
    );
  }

  // 2- verification token (no change happens , expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3- check if the user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new ApiError('The user belongs to this token is no longer exists', 401),
    );
  }

  // 4) check if the user changed password after the token was isssued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError('User recently changed password! Please log in again', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.allowedTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- check if the user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404),
    );
  }

  // 2- If user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 3- hash the reset token
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // 4- save the reset token in db
  user.passwordResetToken = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // 5- send email to user
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError(
        'There was an error sending the email. Please try again later',
        500,
      ),
    );
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email' });
});

exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1- get the user based on the reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ApiError('Password reset code is invalid or has expired', 400),
    );
  }

  // 2- reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset code is valid',
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- get the user based on the email
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(new ApiError('There is no user with that email', 404));
  }

  // 2- update password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  // 3- log the user in
  const token = createToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
