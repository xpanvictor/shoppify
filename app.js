require('express-async-errors')
require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConnection')
const morgan = require('morgan')

const errorHandler = require('./middlewares/error-handler')
const routeNotFound = require('./middlewares/route-not-found')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')
const verifyJWT = require('./middlewares/verifyJWT')

//connect to db
connectDB(process.env.DATABASE_URI)


app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/v1/', (req, res) => {
    return res.status(200).send('Home page')
})
app.use('/api/v1/auth', authRouter)


app.use(verifyJWT)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/carts', cartRouter)
app.use('/api/v1/orders', orderRouter)

app.use(routeNotFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000

mongoose.connection.once('open', () => {
    console.log('Mongoose connected')
    app.listen(PORT, console.log(`Server is listening on port ${PORT}...`))
})