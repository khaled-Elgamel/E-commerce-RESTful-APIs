const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'review ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product'],
    },
  },
  { timestamps: true },
);

// 💥 Unique index to prevent duplicate reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// 💥 Populate user and product fields
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId,
) {
  const stats = await this.aggregate([
    {
      // Stage 1: get all reviews of a product
      $match: { product: productId },
    },
    {
      // Stage 2: grouping reviews based on product id and calculate average ratings and quantity
      $group: {
        _id: '$product',
        ratingsQuantity: { $sum: 1 },
        avgRatings: {
          $avg: '$ratings',
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].ratingsQuantity,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  // this point to the current review (document)
  // this.constructor point to model Review
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

//Why use this.clone().findOne()?
// Because when you run await this.findOne(), Mongoose doesn't allow re-executing the same query
// (it gives an error like: Query was already executed).
// So you clone it and re-execute safely.

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatingsAndQuantity(this.r.product);
});

module.exports = mongoose.model('Review', reviewSchema);
