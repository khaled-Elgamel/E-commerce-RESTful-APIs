const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A coupon must have a name'],
      unique: true,
      trim: true,
    },
    expire: {
      type: Date,
      required: [true, 'A coupon must have an expire date'],
    },
    discount: {
      type: Number,
      required: [true, 'A coupon must have a discount'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Coupon', couponSchema);
