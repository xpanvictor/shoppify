const jwt = require('jsonwebtoken')
const { BadRequest, NotFound, Forbidden, Unauthorized } = require('../errors')
const User = require('../models/User')
const bcryt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')

const REFRESH_EXPIRATION = 24 * 60 * 60 * 1000

const handleRegistration = async (req, res) => {
    //use joi to get the data
    const { email, username, password } = req.body

    if ( !email || !username || !password ) throw new BadRequest('Body must include email, username and password')

    const user = await User.findOne({ email, username })

    if (user) throw new BadRequestError('User already exists')

    const hashedPassword = await bcryt.hash(password, 10)
    
    const result = await User.create({
        email,
        username,
        password: hashedPassword
    })

    return res.status(StatusCodes.CREATED).json({ data: 'User created' })
}


const handleLogin = async (req, res) => {
    //use joi to validate the data
    const { email, password } = req.body
    const cookie = req.cookies

    if ( !email || !password ) throw new BadRequest('Body must include email and password')

    const user = await User.findOne({ email })

    if (!user) throw new NotFound('No user found with this email')

    const match = await bcryt.compare(password, user.password)

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
        return res.status(StatusCodes.OK).json({ accessToken, expires: REFRESH_EXPIRATION })
    }
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
            return res.status(StatusCodes.OK).json({ accessToken, expires: REFRESH_EXPIRATION })
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