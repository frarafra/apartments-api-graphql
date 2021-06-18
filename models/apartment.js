const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  address: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  city: {
    type: String,
    required: true,
    minlength: 3
  },
  country: {
    type: String,
    required: true,
    minlength: 3
  },
  rooms: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
})

module.exports = mongoose.model('Apartment', schema)