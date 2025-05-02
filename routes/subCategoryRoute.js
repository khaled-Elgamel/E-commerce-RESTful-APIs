const express = require('express');
const subCategoryController = require('../controllers/subCategoryController');
const subCategoryValidator = require('../utils/validators/subCategoryValidator');
const authController = require('../controllers/authController');

//
//  mergeParams: Allow us to access parameters on other routers
// ex: We need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    subCategoryController.createFilterObj,
    subCategoryController.getSubCategories,
  )
  .post(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    subCategoryController.setCategoryId,
    subCategoryValidator.createSubCategoryValidator,
    subCategoryController.createSubCategory,
  );

router
  .route('/:id')
  .get(
    subCategoryValidator.getSubcategoryValidator,
    subCategoryController.getSubCategory,
  )
  .patch(
    authController.protect,
    authController.allowedTo('admin', 'manager'),
    subCategoryValidator.updateSubCategoryValidator,
    subCategoryController.updateSubCategory,
  )
  .delete(
    authController.protect,
    authController.allowedTo('admin'),
    subCategoryValidator.deleteSubCategoryValidator,
    subCategoryController.deleteSubCategory,
  );
module.exports = router;
