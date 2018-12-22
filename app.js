require('dotenv').config()

const express = require('express')
const mongoose = require('./db/mongoose')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const helmet = require('helmet')

const itemRoutes = require('./routes/item-routes')
const userRoutes = require('./routes/user-routes')

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')

app.use(helmet())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(methodOverride('_method'))

app.use(itemRoutes)
app.use(userRoutes)

app.use((req, res, next) => {
  res.status(404).send('Sorry, we cannot find that!')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port)

module.exports = app
