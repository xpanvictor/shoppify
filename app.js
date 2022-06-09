require('express-async-errors')
require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConnection')

//connect to db
connectDB(process.env.DATABASE_URI)


app.use(express.json())
app.use(cookieParser())


const PORT = process.env.PORT || 3000

mongoose.connection.once('open', () => {
    console.log('Mongoose connected')
    app.listen(PORT, console.log(`Server is listening on port ${PORT}...`))
})