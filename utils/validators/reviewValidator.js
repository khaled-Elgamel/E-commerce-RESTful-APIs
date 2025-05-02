const { check, body } = require('express-validator');
const validatorController = require('../../controllers/validatorController');
const Review = require('../../models/reviewModel');

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('ratings value required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Ratings value must be between 1 to 5'),
  check('user').isMongoId().withMessage('Invalid user id format'),
  check('product')
    .isMongoId()
    .withMessage('Invalid Product id format')
    .custom(async (val, { req }) => {
      // Check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        throw new Error('You already created a review before');
      }
      return true;
    }),
  validatorController,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validatorController,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // Check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no review with id ${val}`);
      }

      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error(`Your are not allowed to perform this action`);
      }
    }),
  validatorController,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // Check review ownership before delete
      if (req.user.role === 'user') {
        const review = await Review.findById(val);
        if (!review) {
          throw new Error(`There is no review with id ${val}`);
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error(`Your are not allowed to perform this action`);
        }
      }
      return true;
    }),

  validatorController,
];
