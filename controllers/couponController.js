const Coupon = require('../models/couponModel');
const factory = require('./handlerFactory');

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Public
exports.getAllCoupons = factory.getAll(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Public
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private

exports.deleteCoupon = factory.deleteOne(Coupon);
