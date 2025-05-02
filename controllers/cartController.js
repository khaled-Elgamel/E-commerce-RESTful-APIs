const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Product = require('../models/productModel');
const ApiError = require('../utils/apiError');

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);

  // 1- Get cart for logged in user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged in user
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // product exist in cart update the quantity of the product
    const productIndex = cart.cartItems.findIndex(
      item => item.product.toString() === productId && item.color === color,
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    }

    // product not exist in cart , push product to cart items
    else {
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }

  // calculate cart total price
  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );
  cart.totalPriceAfterDiscount = undefined;

  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    message: 'Product added to cart successfully',
    data: {
      cart,
    },
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError('No cart found for this user', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      numberOfCartItems: cart.cartItems.length,
      cart,
    },
  });
});

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true },
  );

  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );
  cart.totalPriceAfterDiscount = undefined;

  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError('No cart found for this user', 404));
  }

  const index = cart.cartItems.findIndex(
    item => item._id.toString() === req.params.itemId,
  );

  if (index > -1) {
    const cartItem = cart.cartItems[index];
    cartItem.quantity = quantity;
    cart.cartItems[index] = cartItem;
  } else {
    return next(new ApiError('No cart item found for this id', 404));
  }

  cart.totalCartPrice = cart.cartItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1- Get Coupon by name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError('Coupon is invalid or expired', 404));
  }

  // 2- Get cart for logged in user to get the total cart price

  const cart = await Cart.findOne({ user: req.user._id });

  cart.totalPriceAfterDiscount = (
    cart.totalCartPrice -
    (cart.totalCartPrice * coupon.discount) / 100
  ).toFixed(2);

  await cart.save();
  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
});
