const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');
const factory = require('./handlerFactory');
const ApiError = require('../utils/apiError');
const { uploadSingleImage } = require('./uploadImageController');

exports.uploadCategoryImage = uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    req.body.image = filename;
  }
  next();
});

exports.getCategories = factory.getAll(Category);
exports.getCategory = factory.getOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.createCategory = factory.createOne(Category);
