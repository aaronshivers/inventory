const jwt = require('jsonwebtoken')

// const User = require('../models/user-model')
// const findByToken = require('../middleware/find-by-token')

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (token) {
    try {
      const decoded = jwt.verify(token, secret)
      verifiedUser = decoded.email
      next(verifiedUser)
    } catch(err) {
      return Promise.reject()
    }
  } else {
    res.sendStatus(401)
  }

  // findByToken(token).then((user) => {
  //   if (!user) {
  //     return Promise.reject()
  //   }
  //   req.user = user
  //   req.token = token
  //   next()
  // }).catch(err => res.sendStatus(401))
}

module.exports = authenticateUser
