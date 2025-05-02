// const slugify = require('slugify');
const { check, body } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorController = require('../../controllers/validatorController');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');

exports.createProductValidator = [
  check('title')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('Product required')
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('To long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Product priceAfterDiscount must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray()
    .withMessage('availableColors should be array of string'),
  check('imageCover').notEmpty().withMessage('Product imageCover is required'),
  check('images')
    .optional()
    .isArray()
    .withMessage('images should be array of string'),
  check('category')
    .notEmpty()
    .withMessage('Product must be belong to a category')
    .isMongoId()
    .withMessage('Invalid ID format')
    .custom(async value => {
      const category = await Category.findById(value);
      if (!category) {
        throw new Error(`No category for this id: ${value}`);
      }
    }),
  check('subcategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom(async values => {
      const subCategories = await SubCategory.find({
        _id: { $exists: true, $in: values },
      });
      if (subCategories.length < 1 || subCategories.length !== values.length) {
        throw new Error('Invalid subcategories IDs');
      }
    })

    .custom(async (values, { req }) => {
      const subcategories = await SubCategory.find({
        category: req.body.category,
      });
      const ids = subcategories.map(sub => sub._id.toString());
      console.log(ids);
      // console.log(values);
      if (!values.every(val => ids.includes(val))) {
        throw new Error('subcategories not belong to category');
      }
    }),

  check('brand').optional().isMongoId().withMessage('Invalid ID formate'),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratingsAverage must be a number')
    .isLength({ min: 1 })
    .withMessage('Rating must be above or equal 1.0')
    .isLength({ max: 5 })
    .withMessage('Rating must be below or equal 5.0'),
  check('ratingsQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratingsQuantity must be a number'),

  validatorController,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorController,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid Brand id format'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorController,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorController,
];
