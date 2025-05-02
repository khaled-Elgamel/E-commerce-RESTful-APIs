const express = require('express');

const authController = require('../controllers/authController');
const wishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.use(authController.protect, authController.allowedTo('user'));
router
  .route('/')
  .get(wishlistController.getLoggedUserWishlist)
  .post(wishlistController.addProductToWishlist);
router.delete('/:productId', wishlistController.deleteProductFromWishlist);

module.exports = router;
