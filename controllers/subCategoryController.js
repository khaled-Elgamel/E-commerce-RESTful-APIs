const asyncHandler = require('express-async-handler');
const SubCategory = require('../models/subCategoryModel');
const ApiFeatures = require('../utils/apiFeatures');
const factory = require('./handlerFactory');

exports.setCategoryId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
    req.filterObj = filterObject;
  }
  next();
};
exports.getSubCategory = factory.getOne(SubCategory);
exports.getSubCategories = factory.getAll(SubCategory);
exports.deleteSubCategory = factory.deleteOne(SubCategory);
exports.updateSubCategory = factory.updateOne(SubCategory);
exports.createSubCategory = factory.createOne(SubCategory);
