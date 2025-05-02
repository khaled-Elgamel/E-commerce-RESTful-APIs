const mongoose = require('mongoose');
// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand required'],
      unique: [true, 'Brand must be unique'],
      minlength: [2, 'Too short Brand name'],
      maxlength: [32, 'Too long Brand name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true },
);

// find one ,find all, update

const setImageUrl = doc => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
brandSchema.post('init', doc => {
  setImageUrl(doc);
});

// create ,  save
brandSchema.post('save', doc => {
  setImageUrl(doc);
});

module.exports = mongoose.model('Brand', brandSchema);
