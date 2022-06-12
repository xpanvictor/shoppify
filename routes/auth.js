const express = require('express')
const router = express.Router()
const { handleLogin, handleRegistration, handleLogout, handleRefreshToken } = require('../controllers/auth')
const verifyJWT = require('../middlewares/verifyJWT')

router.route('/register').post(handleRegistration)
router.route('/login').post(handleLogin)
router.route('/logout').get(handleLogout)
router.route('/refresh-token').get(handleRefreshToken)


module.exports = router