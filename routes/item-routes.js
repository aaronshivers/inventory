const express = require('express')
const router = express.Router()
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const Inventory = require('../models/item-model')
const authenticateUser = require('../middleware/authenticate-user')

// GET /
router.get('/', (req, res) => res.render('index'))

// GET /items
router.get('/items', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id

    Inventory.find({owner}).then((items) => {
      res.render('items', { items })
    }).catch(err => res.sendStatus(400))
  })
})

// GET /items/new
router.get('/items/new', authenticateUser, (req, res) => res.render('new-item'))


// POST /items
router.post('/items', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const { name, model, serial } = req.body
    const item = new Inventory({ name, model, serial, owner })

    item.save().then(() => {
      res.redirect('items')
    }).catch(err => res.sendStatus(400))
  })
})

// GET /items/:id
router.get('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const conditions = {_id, owner}

    Inventory.findOne(conditions).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      }
      res.render('view-item', { item })
    }).catch(err => res.status(400).send())
  })
})

// GET /items/:id/edit
router.get('/items/:id/edit', authenticateUser, (req, res) => {
  const id = req.params.id

  Inventory.findById(id).then((item) => {
    res.render('edit-item', { item })
  }).catch(err => res.send(err.message))
})

// DELETE /items/:id
router.delete('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const conditions = {_id, owner}
    Inventory.findOneAndDelete(conditions).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      }
      res.redirect('/items')
    }).catch(err => res.status(400).send())
  })
})

// PATCH /items/:id
router.patch('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    if (!owner) {
      res.sendStatus(404)
    }

    const conditions = {_id, owner}
    const { name, model, serial } = req.body
    const update = { name, model, serial }
    const options = { new: true }

    Inventory.findOneAndUpdate(conditions, update, options).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      } else {
        res.redirect('/items')
      }
    }).catch(err => res.send(err.message))
  })
})

// POST /find
router.post('/find', (req, res) => {
  name = req.body.name
  Inventory.findOne({ name }).then((item) => {
    console.log(item)
    if (!item) {
      res.status(404).send('Item Not Found')
    } else {
      res.render('view', { item })
    }
  })
})

module.exports = router
