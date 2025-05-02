const { check, body } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorController = require('../../controllers/validatorController');

exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('invalid category id format'),
  validatorController,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category required')
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),

  validatorController,
];

exports.deleteCategoryValidator = [
  check('id').isMongoId().withMessage('invalid category id format'),
  validatorController,
];

exports.updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorController,
];
