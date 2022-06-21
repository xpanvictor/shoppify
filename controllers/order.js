const { StatusCodes } = require('http-status-codes')
const { BadRequest, NotFound } = require('../errors')
const { orderSchema } = require('../helpers/validation_schema')
const Order = require('../models/Order')
const Product = require('../models/Product')


const createOrder = async (req, res) => {
    const userId = req.user.id

    const validationResult = await orderSchema.validateAsync(req.body)
    
    validationResult.userId = userId

    const order = await Order.create(validationResult)

    return res.status(StatusCodes.OK).json({ order })
}


const updateOrder = async (req, res) => {
    const { id: orderId } = req.params

    if (!orderId) throw new BadRequest('No id provided with url')

    const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, {new: true})

    return res.status(StatusCodes.OK).json(updatedOrder)
}


const deleteOrder = async (req, res) => {
    const { id: orderId } = req.params

    if (!orderId) throw new BadRequest('No id provided with url')

    const updatedOrder = await Order.findByIdAndDelete(orderId)

    return res.status(StatusCodes.OK).json({ message: "Cart has been deleted" })
}


const getUserOrders = async (req, res) => {
    const { userId } = req.params

    if (!userId) throw new BadRequest('No id provided with url')

    const order = await Order.findOne({ userId })

    return res.status(StatusCodes.OK).json(order)
}


const getAllOrders = async (req, res) => {
    
    const orders = await Order.find()

    return res.status(StatusCodes.OK).json(orders)
}


module.exports = {
    createOrder, updateOrder, deleteOrder, getUserOrders, getAllOrders
}