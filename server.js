const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');
// const xss = require('xss-clean');
const ESAPI = require('node-esapi');

const categoryRouter = require('./routes/categoryRoute');
const subCategoryRouter = require('./routes/subCategoryRoute');
const brandRouter = require('./routes/brandRoute');
const productRouter = require('./routes/productRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const whishlistRouter = require('./routes/wishlistRoute');
const addressRouter = require('./routes/addressRoute');
const couponRouter = require('./routes/couponRoute');
const cartRouter = require('./routes/cartRoute');
const orderRouter = require('./routes/orderRoute');

const ApiError = require('./utils/apiError');
const globalErrorHandler = require('./controllers/errorController');
const orderController = require('./controllers/orderController');

dotenv.config({
  path: './config.env',
});

// Database connection
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(db)
  .then(con => console.log(`Database Connected: ${con.connection.host}`))
  .catch(error => {
    console.log(`Database Error : ${error}`);
    process.exit(1);
  });

// express app
const app = express();

// Enable other domains to acess our application
app.use(cors());
app.options('/{*any}', cors());

// Compress all responses
app.use(compression());

//Checkout Webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout,
);

// Middlewares

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '20kb' }));

// Sanitize data
app.use(expressMongoSanitize());

// Data sanitization against XSS
// app.use(ESAPI.middleware());  not working

// Serving static files
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many request from this ip , Please try again later ',
});

// Apply the rate limiting middleware to all requests.
app.use('/api', limiter);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'price',
      'sold',
      'quantity',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);

//Routes
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/wishlists', whishlistRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/orders', orderRouter);

// version > 5
// app.all('*', (req, res, next) => {
//   next(new ApiError(`Cannot find ${req.originalUrl} on this server!`, 404));
// });

// new version 5
// app.all('/*splat', (req, res, next) => {
//   next(new ApiError(`Cannot find ${req.originalUrl} on this server!`, 404));
// });
app.all(/(.*)/, (req, res, next) => {
  next(new ApiError(`Cannot find ${req.originalUrl} on this server!`, 404));
});
// Global error handling middleware for express
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// handled rejection outside express
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION ! SHUTTING DOWN ....');
  server.close(() => {
    process.exit(1);
  });
});
