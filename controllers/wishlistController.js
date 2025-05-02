const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.deleteProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $ pull==> remove the value from the array if it exists
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    message: 'Product successfully removed from wishlist',
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: {
      wishlist: user.wishlist,
    },
  });
});
