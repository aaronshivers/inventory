require('dotenv').config()

const express = require('express')
const mongoose = require('./db/mongoose')
const cookieParser = require('cookie-parser')

const itemRoutes = require('./routes/item-routes')
const userRoutes = require('./routes/user-routes')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cookieParser())

app.use(itemRoutes)
app.use(userRoutes)

app.listen(port)

module.exports = app
