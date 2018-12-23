const mongoose = require('mongoose')
const Schema = mongoose.Schema

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
    trim: true
  },
  model: {
    type: String,
    minlength: 1,
    maxlength: 100,
    trim: true
  },
  serial: {
    type: String,
    minlength: 1,
    maxlength: 100,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

const Inventory = mongoose.model('Inventory', itemSchema)

module.exports = Inventory
