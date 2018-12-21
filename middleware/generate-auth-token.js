const jwt = require('jsonwebtoken')

const generateAuthToken = (user) => {
  const access = 'auth'
  const payload = { _id: user._id, access }
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '2d', issuer: 'https://www.demo.com' }
  const token = jwt.sign(payload, secret, options)

  return {token, user}
}

module.exports = generateAuthToken
