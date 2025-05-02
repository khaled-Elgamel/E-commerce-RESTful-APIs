const jwt = require('jsonwebtoken');

const createToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

module.exports = createToken;
