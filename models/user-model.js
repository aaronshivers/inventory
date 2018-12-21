const mongoose = require('mongoose')
const validator = require('validator')

const hashPassword = require('../middleware/hash-password')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 7,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email address.`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Inventory'
  }]
})

hashPassword(userSchema)

const User = mongoose.model('User', userSchema)

module.exports = User
