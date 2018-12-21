const jwt = require('jsonwebtoken')

const findByToken = (token) => {
  const secret = process.env.JWT_SECRET
  const decoded = jwt.verify(token, secret)

  if (token) {
    try {
      verifiedUser = decoded.email
      next()
    } catch (err) {
      return Promise.reject()
    }
    return User.findOne({
      '_Id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    })
  } else {
    res.sendStatus(401)
  }
}

module.exports = findByToken
