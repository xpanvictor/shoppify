const express = require('express')
const router = express.Router()
const { createProduct, deleteProduct, updateProduct, getProduct, getAllProducts } = require('../controllers/product')
const { addToCart } = require('../controllers/cart')

router.route('/:id/add-to-cart').post(addToCart)

router.route('/:id').delete(deleteProduct).put(updateProduct).get(getProduct)

router.route('/').post(createProduct).get(getAllProducts)


module.exports = router