const express = require('express')
const router = express.Router()
const { updateCart, deleteCart, getCart, getAllCarts } = require('../controllers/cart')
const verifyRoles = require('../middlewares/verifyRoles')
const ROLES_LIST = require('../config/roles-list')


router.route('/').get(verifyRoles(ROLES_LIST.Admin), getAllCarts)
router.route('/:id').patch(updateCart).delete(deleteCart)
router.route('/:userId').get(getCart)

module.exports = router