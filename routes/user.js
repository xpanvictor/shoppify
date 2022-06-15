const express = require('express')
const router = express.Router()
const verifyRoles = require('../middlewares/verifyRoles')
const ROLES_LIST = require('../config/roles-list')
const { updateUser, deleteUser, getUser, getAllUsers, getUsersStats } = require('../controllers/user')


router.route('/stats').get(getUsersStats)


router.route("/:id")
    .put(verifyRoles(ROLES_LIST.User, ROLES_LIST.Admin), updateUser)
    .delete(verifyRoles(ROLES_LIST.Admin), deleteUser)
    .get(verifyRoles(ROLES_LIST.Admin), getUser)


router.route('/').get(getAllUsers)


module.exports = router