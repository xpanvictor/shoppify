const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')
const { Unauthorized } = require('../errors')


const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.Authorization || req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) throw new Unauthorized('No token')

    const accessToken = authHeader.split(' ')[1]

    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) { 
                return res.status(StatusCodes.UNAUTHORIZED).send('Bad Token or expired token')
            }

            req.user = {
                id: decoded.UserInfo.id,
                email: decoded.UserInfo.email
            }
            
            req.roles = decoded.UserInfo.roles
            next()
        }
    )
}

module.exports = verifyJWT