const { StatusCodes } = require('http-status-codes')
const { BadRequest, NotFound } = require('../errors')
const Cart = require('../models/Cart')
const Product = require('../models/Product')


const addToCart = async (req, res) => {
    const userId = req.user.id
    const { id: productId } = req.params
    const { quantity } = req.body

    if (!productId) throw new BadRequest('No id provided with url')


    let foundCart = await Cart.findOne({ userId })

    if (!foundCart) {
        foundCart = new Cart()
    }


    const foundProduct = await Product.findById(productId)

    if (!foundProduct) throw new NotFound('Product not found')


    const productData = {
        productId: foundProduct._id,
        quantity
    }

    let duplicateProduct = foundCart.products.find(product => product.productId === productId)

    if (duplicateProduct) {
        duplicateProduct.quantity += 1
    }else {
        foundCart.userId = userId
        foundCart.products.push(productData)
    }

    const result = await foundCart.save()

    return res.status(StatusCodes.OK).json({ cart: result })
}


const updateCart = async (req, res) => {
    const { id: cartId } = req.params

    if (!cartId) throw new BadRequest('No id provided with url')

    const updatedCart = await Cart.findByIdAndUpdate(cartId, req.body, {new: true})

    return res.status(StatusCodes.OK).json(updatedCart)
}


const deleteCart = async (req, res) => {
    const { id: cartId } = req.params

    if (!cartId) throw new BadRequest('No id provided with url')

    const cart = await Cart.findByIdAndDelete(cartId)

    return res.status(StatusCodes.OK).json({ message: "Cart has been deleted" })
}


const getCart = async (req, res) => {
    const { userId } = req.params

    if (!userId) throw new BadRequest('No id provided with url')

    const cart = await Cart.findOne({ userId })

    return res.status(StatusCodes.OK).json(cart)
}


const getAllCarts = async (req, res) => {
    
    const carts = await Cart.find()

    return res.status(StatusCodes.OK).json(carts)
}


module.exports = {
    addToCart, updateCart, deleteCart, getCart, getAllCarts
}