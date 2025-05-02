const mongoose = require('mongoose');
const bcrybt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, 'password required'],
      minlength: [6, 'Too short password'],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,
    },
    // child reference (one to many)

    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
    ],
    addresses: [
      {
        id: mongoose.Schema.Types.ObjectId,
        alias: String,
        details: String,
        phone: String,
        postalCode: String,
        city: String,
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // hashing user password
  this.password = await bcrybt.hash(this.password, 12);
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
