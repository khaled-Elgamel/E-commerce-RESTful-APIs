const express = require('express');
const productController = require('../controllers/productController');
const productValidator = require('../utils/validators/productValidator');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productController.getProducts)
  .post(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productValidator.createProductValidator,
    productController.createProduct,
  );

router
  .route('/:id')
  .get(productValidator.getProductValidator, productController.getProduct)
  .patch(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productValidator.updateProductValidator,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.allowedTo('admin'),
    productValidator.deleteProductValidator,
    productController.deleteProduct,
  );
module.exports = router;
