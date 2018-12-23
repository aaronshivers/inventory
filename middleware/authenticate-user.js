const jwt = require('jsonwebtoken')

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
}

module.exports = authenticateUser
