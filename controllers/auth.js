const jwt = require('jsonwebtoken')
const { BadRequest, NotFound, Forbidden, Unauthorized } = require('../errors')
const User = require('../models/User')
const bcryt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')
const { registrationSchema, loginSchema } = require('../helpers/validation_schema')

const REFRESH_EXPIRATION = 24 * 60 * 60 * 1000
const ACCESS_EXPIRATION = 15 * 60 * 1000

const handleRegistration = async (req, res) => {

    const validationResult = await registrationSchema.validateAsync(req.body)
    
    const hashedPassword = await bcryt.hash(validationResult.password, 10)
    
    const result = await User.create({
        email: validationResult.email,
        username: validationResult.username,
        password: hashedPassword
    })

    return res.status(StatusCodes.CREATED).json({ data: 'User created' })
}


const handleLogin = async (req, res) => {
 
    const validationResult = await loginSchema.validateAsync(req.body)
    const cookie = req.cookies

    const user = await User.findOne({ email: validationResult.email })

    if (!user) throw new NotFound('No user found with this email')

    const match = await bcryt.compare(validationResult.password, user.password)

    if (match) {
        const roles = Object.values(user.roles)
        
        const accessToken = jwt.sign(
            { UserInfo: {
                email: user.email,
                roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
        )

        const newRefreshToken = jwt.sign(
        {email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
        )

        let newRefreshTokenArray = cookie?.jwt ? user.refreshToken.filter(token => token !== cookie?.jwt) : user.refreshToken

        if (cookie?.jwt) {

            const refreshToken = cookie.jwt
            const foundToken = await User.findOne({ refreshToken })

            if (!foundToken) {
                //token reuse
                newRefreshTokenArray = []
            }

            res.clearCookie('jwt', { httpOnly: true, maxAge: REFRESH_EXPIRATION, sameSite: 'None'})
        }

        user.refreshToken = [...newRefreshTokenArray, newRefreshToken]
        const result = await user.save()

        res.cookie('jwt', newRefreshToken, { httpOnly: true, maxAge: REFRESH_EXPIRATION, sameSite: 'None'}) //secure: true
        return res.status(StatusCodes.OK).json({ accessToken, expires: ACCESS_EXPIRATION })
    }

    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Details do not match' })
}


const handleRefreshToken = async (req, res) => {
    const cookie = req.cookies

    if (!cookie?.jwt) throw new Forbidden('You do not the have a cookie')

    const refreshToken = cookie.jwt

    const foundUser = await User.findOne({ refreshToken })

    const newRefreshTokenArray = foundUser.refreshToken.filter(token => token !== refreshToken)

    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) throw new Unauthorized('This is a bad token')
                const email = decoded.email

                const hackedUser = await User.findOne({ email })

                hackedUser.refreshToken = []

                const result = await hackedUser.save()
            }
        )
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                foundUser.refreshToken = [...newRefreshTokenArray]
                const result = await foundUser.save()
            }
            
            if (err || decoded.email !== foundUser.email) throw new Unauthorized('This is a bad token')
            
            const roles = Object.values(foundUser.roles)
        
            const accessToken = jwt.sign(
                { UserInfo: {
                    email: foundUser.email,
                    roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            const newRefreshToken = jwt.sign(
                {email: foundUser.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            )

            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
            const result = await foundUser.save()

            res.cookie('jwt', newRefreshToken, { httpOnly: true, maxAge: REFRESH_EXPIRATION, sameSite: 'None'}) //secure: true
            return res.status(StatusCodes.OK).json({ accessToken, expires: ACCESS_EXPIRATION })
        }
    )

}


const handleLogout = async (req, res) => {
    //clear token on the frontend also
    const cookie = req.cookies

    if (!cookie?.jwt) return res.sendStatus(StatusCodes.NO_CONTENT)

    const refreshToken = cookie.jwt

    const foundUser = await User.findOne({ refreshToken })

    if (!foundUser) {

        res.clearCookie('jwt', { httpOnly: true, maxAge: REFRESH_EXPIRATION, sameSite: 'None'})
        return res.sendStatus(StatusCodes.NO_CONTENT)
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(token => token !== refreshToken)
    const result = await foundUser.save()

    res.clearCookie('jwt', { httpOnly: true, maxAge: REFRESH_EXPIRATION, sameSite: 'None'})
    return res.sendStatus(StatusCodes.NO_CONTENT)
}


module.exports = {
    handleLogin,
    handleRegistration,
    handleRefreshToken,
    handleLogout
}