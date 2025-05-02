const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:cartId',
  authController.allowedTo('user'),
  orderController.createCheckoutSession,
);

router
  .route('/')
  .get(
    authController.allowedTo('user', 'admin', 'manager'),
    orderController.filterOrders,
    orderController.getAllOrders,
  );

router.post(
  '/:cartId',
  authController.allowedTo('user'),
  orderController.createCashOrder,
);
router.get('/:id', orderController.getSpecificOrder);

router.patch(
  '/:id/pay',
  authController.allowedTo('admin', 'manager'),
  orderController.updateOrderToPaid,
);
router.patch(
  '/:id/deliver',
  authController.allowedTo('admin', 'manager'),
  orderController.updateOrderToDelivered,
);

module.exports = router;
