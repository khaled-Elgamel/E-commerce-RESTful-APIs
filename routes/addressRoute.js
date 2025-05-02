const express = require('express');

const authController = require('../controllers/authController');
const addressController = require('../controllers/addressController');

const router = express.Router();

router.use(authController.protect, authController.allowedTo('user'));
router
  .route('/')
  .get(addressController.getLoggedUserAddresses)
  .post(addressController.addAddress);
router.delete('/:addressId', addressController.removeAddress);

module.exports = router;
