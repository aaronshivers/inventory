const User = require('../models/user-model')

const removeToken = (userId, token) => {
  User.findById({ _id: userId }).then((user) => {
    
    return user.update({
      $pull: {
        tokens: { token }
      }
    })
  }).catch(err => res.send(err))
}

module.exports = removeToken
