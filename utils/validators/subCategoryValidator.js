const { check, body } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorController = require('../../controllers/validatorController');

exports.getSubcategoryValidator = [
  check('id').isMongoId().withMessage('invalid subcategory id format'),
  validatorController,
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('subcategory required')
    .isLength({ min: 2 })
    .withMessage('Too short subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long subcategory name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check('category')
    .isMongoId()
    .withMessage('invalid category id format')
    .notEmpty()
    .withMessage('subcategory must belong to category'),

  validatorController,
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('invalid subcategory id format'),
  validatorController,
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorController,
];
