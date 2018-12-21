const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb')

const Inventory = require('../models/item-model')
const User = require('../models/user-model')
const generateAuthToken = require('../middleware/generate-auth-token')

const secret = process.env.JWT_SECRET
 
// USERS ======================================

const userOneId = new ObjectId()
const userTwoId = new ObjectId()

const users = [{
  _id: userOneId,
  email: 'testuser1@example.com',
  password: 'password1'
}, {
  _id: userTwoId,
  email: 'testuser2@example.com',
  password: 'password1'
}]

const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    const userOne = new User(users[0]).save()
    const userTwo = new User(users[1]).save()

    return Promise.all([userOne, userTwo])
  }).then(() => done())
}

// ITEMS ======================================

const items = [{
  _id: new ObjectId(),
  name: 'test item 1',
  owner: userOneId
}, {
  _id: new ObjectId(),
  name: 'test item 2',
  owner: userTwoId
}]

const populateInventory = (done) => {
  Inventory.deleteMany({}).then(() => {
    const itemOne = new Inventory(items[0]).save()
    const itemTwo = new Inventory(items[1]).save()

    // return Promise.all([itemOne, itemTwo])
  }).then(() => done())
}

// Tokens ======================================

const getToken = (user) => {
  const access = 'auth'
  const payload = { _id: user._id, access }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '2d', issuer: 'https://www.demo.com' }
  const token = jwt.sign(payload, secret, options)

  return token
}

const tokens = {
  token0: getToken(users[0]),
  token1: getToken(users[1])
}

// Export ======================================

module.exports = {
  items,
  populateInventory,
  users,
  populateUsers,
  tokens
}