const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const categoryValidator = require('../utils/validators/categoryValidator');
const subCategoryRouter = require('./subCategoryRoute');

const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRouter);
router
  .route('/')
  .get(categoryController.getCategories)
  .post(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryValidator.createCategoryValidator,
    categoryController.createCategory,
  );

router
  .route('/:id')
  .get(categoryValidator.getCategoryValidator, categoryController.getCategory)
  .patch(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryValidator.updateCategoryValidator,
    categoryController.updateCategory,
  )
  .delete(
    authController.protect,
    authController.allowedTo('admin'),
    categoryValidator.deleteCategoryValidator,
    categoryController.deleteCategory,
  );
module.exports = router;
