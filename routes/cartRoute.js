const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.allowedTo('user'));
router
  .route('/')
  .post(cartController.addProductToCart)
  .get(cartController.getLoggedUserCart)
  .delete(cartController.clearCart);

// Always define static routes before dynamic routes (:params), to avoid conflicts.
// Define specific path FIRST
router.patch('/applyCoupon', cartController.applyCoupon);

// THEN define dynamic route
router
  .route('/:itemId')
  .patch(cartController.updateCartItemQuantity)
  .delete(cartController.removeProductFromCart);

module.exports = router;
