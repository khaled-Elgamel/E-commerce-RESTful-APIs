const slugify = require('slugify');
const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const validatorController = require('../../controllers/validatorController');
const User = require('../../models/userModel');

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async val => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error('email is already in use');
      }
    }),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),

  validatorController,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorController,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(val =>
      User.findOne({ email: val }).then(user => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      }),
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),
  validatorController,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorController,
];

exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  check('currentPassword')
    .notEmpty()
    .withMessage('please enter your current password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error('There is no user for this id');
      }
      const isCorrectPassword = await bcrypt.compare(val, user.password);
      if (!isCorrectPassword) {
        throw new Error('incorrect password');
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('please enter the new password')
    .custom((val, { req }) => {
      // 2) Verify password confirm

      if (val !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('please confirm the password'),
  validatorController,
];

exports.updateLoggedUserValidator = [
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom(val =>
      User.findOne({ email: val }).then(user => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      }),
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  validatorController,
];
