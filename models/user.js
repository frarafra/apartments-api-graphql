const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
    }
  ]
});

module.exports = mongoose.model('User', schema)