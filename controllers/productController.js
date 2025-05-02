const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const { uploadMixOfImages } = require('./uploadImageController');

exports.getProducts = factory.getAll(Product, 'Product');
exports.getProduct = factory.getOne(Product, 'reviews');
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);

exports.uploadProductImages = uploadMixOfImages([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 3 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1) handle image cover

  req.body.imageCover = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/products/${req.body.imageCover}`);

  //2) handle images

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/products/${fileName}`);

      req.body.images.push(fileName);
    }),
  );
  next();
});
exports.createProduct = factory.createOne(Product);
