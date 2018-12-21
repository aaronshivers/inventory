const bcrypt = require('bcrypt')
const User = require('../models/user-model')

const findByCredentials = (email, password) => {
  
  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject(new Error('User Not Found'))
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          resolve(user)
        } else {
          reject('Password Invalid')
        }
      })
    })
  })
}

module.exports = findByCredentials
