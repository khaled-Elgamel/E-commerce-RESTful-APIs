const express = require('express');
const couponController = require('../controllers/couponController');
const AuthController = require('../controllers/authController');

const router = express.Router();

router.use(
  AuthController.protect,
  AuthController.allowedTo('admin', 'manager'),
);
router
  .route('/')
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

router
  .route('/:id')
  .get(couponController.getCoupon)
  .patch(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
