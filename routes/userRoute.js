const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const userValidator = require('../utils/validators/userValidator');
const authValidator = require('../utils/validators/authValidator');

const router = express.Router();

router.post('/signup', authValidator.signUpValidator, authController.signUp);
router.post('/login', authValidator.loginValidator, authController.login);
router.post('/forgetPassword', authController.forgotPassword);
router.post(
  '/verifyPasswordResetToken',
  authController.verifyPasswordResetCode,
);
router.patch('/resetPassword', authController.resetPassword);

// protect all routes after this middleware

router.use(authController.protect);

router.get('/me', userController.getLoggedUserData, userController.getUser);
router.patch('/changeMyPassword', userController.updateLoggedUserPassword);
router.patch(
  '/updateMe',
  userController.uploadUserImage,
  userController.resizeImage,
  userValidator.updateLoggedUserValidator,
  userController.updateLoggedUserData,
);

router.delete('/deleteMe', userController.deleteLoggedUserData);

/////////////////////////////////////////////////////////////////////

/////////////////////////////////ADMIN ROUTES/////////////////////////////
router.use(authController.allowedTo('admin', 'manager'));
router
  .route('/')
  .get(userController.getUsers)
  .post(
    userController.uploadUserImage,
    userController.resizeImage,
    userValidator.createUserValidator,
    userController.createUser,
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    userController.uploadUserImage,
    userController.resizeImage,
    userValidator.updateUserValidator,
    userController.updateUser,
  )
  .delete(userController.deleteUser);

router.patch(
  '/changePassword/:id',
  userValidator.changeUserPasswordValidator,
  userController.changeUserPassword,
);
module.exports = router;
