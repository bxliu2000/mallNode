var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Restaurant = new Schema({
  restaurantName: {
    type: String,
    unique: true,
    required: true
  },
  restaurantAvatar: {
    type: String
  },
  description: String,
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  navLink: String
});

module.exports = mongoose.model('Restaurant', Restaurant);