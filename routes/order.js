const express = require('express')
const router = express.Router()
const verifyRoles = require('../middlewares/verifyRoles')
const ROLES_LIST = require('../config/roles-list')
const {
    createOrder, updateOrder, deleteOrder, getUserOrders, getAllOrders
} = require('../controllers/order')

router.route('/').get(verifyRoles(ROLES_LIST.Admin), getAllOrders).post(createOrder)
router.route('/:id').patch(updateOrder).delete(deleteOrder)
router.route('/:userId').get(getUserOrders)

module.exports = router