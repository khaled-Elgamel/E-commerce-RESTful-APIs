const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../../models/productModel');
require('colors');

dotenv.config({ path: './config.env' });
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(db).then(() => console.log('DB connection successful'));

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') insertData();
if (process.argv[2] === '--delete') destroyData();
