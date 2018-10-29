const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const CommentSchema = new Schema({
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true
  },
  images: [String],
  comment: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
    timestamps: true
  });

const DishSchema = new Schema({
  dish_name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  comments: [CommentSchema]
}, {
    timestamps: true
  });

const Dishes = mongoose.model('Dish', DishSchema);

module.exports = Dishes;