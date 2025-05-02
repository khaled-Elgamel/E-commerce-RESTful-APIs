const { check, body } = require('express-validator');
const slugify = require('slugify');
const validatorController = require('../../controllers/validatorController');

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorController,
];

exports.createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand required')
    .isLength({ min: 2 })
    .withMessage('Too short Brand name')
    .isLength({ max: 32 })
    .withMessage('Too long Brand name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorController,
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });

      return true;
    }),
  validatorController,
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  validatorController,
];
