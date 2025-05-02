const mongoose = require('mongoose');
// create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A category name required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [50, 'Too long category name'],
    },

    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true, // add timestamps will add two fields created at and updated at
  },
);

// find one ,find all, update

const setImageUrl = doc => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
categorySchema.post('init', doc => {
  setImageUrl(doc);
});

// create ,  save
categorySchema.post('save', doc => {
  setImageUrl(doc);
});

// create model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
