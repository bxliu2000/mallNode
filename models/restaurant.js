const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
  restaurant_name: {
    type: String,
    unique: true,
    required: true
  },
  image: {
    type: String
  },
  description:{
    type: String,
    required: true
  },
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0, 
    min: 0,
    max: 5
  },
  navLink: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);