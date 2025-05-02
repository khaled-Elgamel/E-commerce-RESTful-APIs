const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const reviewValidator = require('../utils/validators/reviewValidator');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getReviews)
  .post(
    authController.protect,
    authController.allowedTo('user'),
    reviewController.setProductAndUserId,
    reviewValidator.createReviewValidator,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.allowedTo('user'),
    reviewValidator.updateReviewValidator,
    reviewController.updateReview,
  )
  .delete(
    authController.protect,
    authController.allowedTo('admin', 'user', 'manager'),
    reviewValidator.deleteReviewValidator,
    reviewController.deleteReview,
  );
module.exports = router;
