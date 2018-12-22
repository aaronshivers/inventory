const express = require('express')
const router = express.Router()
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user-model')
const generateAuthToken = require('../middleware/generate-auth-token')
const authenticateUser = require('../middleware/authenticate-user')

// Disabled until admin validation is created
// GET /users
// router.get('/users', authenticateUser, (req, res) => {
//   User.find({}).then((users) => {
//     res.render('users', { users })
//   }).catch(err => res.status(400).send(err))
// })

// GET /signup
router.get('/signup', (req, res) => {
  res.render('signup')
})

// POST /users
router.post('/users', (req, res) => {
  const { email, password } = req.body
  const user = new User({ email, password })
  const validation = /((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)).{8,100}/

  if (!password.match(validation)) {
    res.send('Password must contain 8-100 characters, with at least one lowercase letter, one uppercase letter, one number, and one special character.')
  } else {
    user.save().then(() => {
      return generateAuthToken(user)
    }).then((value) => {
      res.cookie('token', value.token, { expires: new Date(Date.now() + 86400000) }).redirect('profile')
    }).catch(err => res.status(400).send(err.message))
  }
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

// GET /users/:id/edit
router.get('/users/:id/edit', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const decodedId = decoded._id
    const inputId = req.params.id

    if (decodedId !== inputId) {
      res.send(401).send('Invalid User Id')
    } else {
      User.findById(decodedId).then((user) => {
        res.render('edit-user', { user })
      }).catch(err => res.send(err.message))
    }
  })
})

// DELETE /users/:id
router.delete('/users/:id', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const decodedId = decoded._id
    const inputId = req.params.id

    if (decodedId !== inputId) {
      res.send(401).send('Invalid User Id')
    } else {

      if (!ObjectId.isValid(inputId)) {
        return res.status(404).send('Invalid ObjectId')
      }

      User.findByIdAndDelete(inputId).then((user) => {
        if (!user) {
          res.status(404).send('Item Not Found')
        }
        res.clearCookie('token').redirect('/')
      }).catch(err => res.status(400).send(err.message))
    }
  })
})

// PATCH /items/:id
router.patch('/users/:id', authenticateUser, (req, res) => {
  const password = req.body.password
  const saltRounds = 10

  bcrypt.hash(password, saltRounds).then((hash) => {
    const id = req.params.id
    const update = { email: req.body.email, password: hash }
    const options = { new: true }
    
    User.findByIdAndUpdate(id, update, options).then((user) => {
      if (!user) {
        res.status(404).send('User Not Found')
      }
      res.redirect('/profile')
    })
  }).catch(err => res.send(err.message))
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
      res.status(404).send('User not found. Try signing up first.')
    } else {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          const access = 'auth'
          const payload = { _id: user._id, access }
          const secret = process.env.JWT_SECRET
          const options = { expiresIn: '1d', issuer: 'https://www.demo.com' }
          const token = jwt.sign(payload, secret, options)

          res.cookie('token', token, { expires: new Date(Date.now() + 86400000) }).redirect('/profile')
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
