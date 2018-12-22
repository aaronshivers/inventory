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

app.listen(port)

module.exports = app
