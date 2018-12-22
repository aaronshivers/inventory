const express = require('express')
const router = express.Router()
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user-model')
const generateAuthToken = require('../middleware/generate-auth-token')
// const findByCredentials = require('../middleware/find-by-credentials')
const authenticateUser = require('../middleware/authenticate-user')
// const removeToken = require('../middleware/remove-token')
// const findByToken = require('../middleware/find-by-token')

// GET /users
router.get('/users', authenticateUser, (req, res) => {
  User.find({}).then((users) => {
    res.render('users', { users })
  }).catch(err => res.status(400).send(err))
})

// POST /users
router.post('/users', (req, res) => {
  const { email, password } = req.body
  const user = new User({ email, password })

  user.save().then(() => {
    return generateAuthToken(user)
  }).then((value) => {
    res.cookie('token', value.token, { expires: new Date(Date.now() + 86400000) }).send(value.user.email)
  }).catch(err => res.status(400).send(err))
})

// GET /users/:id
router.get('/users/:id', authenticateUser, (req, res, next) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  User.findById(id).then((user) => {
    if (!user) {
      res.status(404).send('User Not Found')
    }
    res.render('profile', { user })
  }).catch(err => res.status(400).send())
})

// DELETE /users/:id
router.delete('/users/:id', authenticateUser, (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  User.findByIdAndDelete(id).then((user) => {
    if (!user) {
      res.status(404).send('Item Not Found')
    }
    res.send({ user })
  }).catch(err => res.status(400).send())
})

// PATCH /items/:id
router.patch('/users/:id', authenticateUser, (req, res) => {
  const id = req.params.id
  const update = { email: req.body.email, password: req.body.password }
  const options = { new: true }

  User.findByIdAndUpdate(id, update, options).then((user) => {
    if (!user) {
      res.status(404).send('User Not Found')
    }
    res.send({ user })
  })
})

// Signup =====================================

// GET /signup
router.get('/signup', (req, res) => {
  res.redirect('profile')
})

// LOGIN =====================================

// GET /login
router.get('/login', (req, res) => {
  res.render('login')
})

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  User.findOne({email}).then((user) => {
    if (!user) {
      res.send(err.message)
    } else {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          const access = 'auth'
          const payload = { _id: user._id, access }
          const secret = process.env.JWT_SECRET
          const options = { expiresIn: '1d', issuer: 'https://www.demo.com' }
          const token = jwt.sign(payload, secret, options)

          res.cookie('token', token, { expires: new Date(Date.now() + 86400000) }).send(user.email)
        } else {
          res.status(401).send('Invalid Password')
        }
      })
    }
  }).catch(err => res.sendStatus(401))
})

// GET /users/profile
router.get('/profile', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const id = decoded._id

    User.findById(id).then((user) => {
      res.render('profile', { user })
    })
  })
})

// DELETE /users/logout
router.delete('/logout', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const id = decoded._id

    User.findById(id).then((user) => {
      res.clearCookie('token').send('You\'ve been logged out.')
    })
  })
})

module.exports = router
