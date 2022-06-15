const { Forbidden, Unauthorized } = require("../errors")


const verifyRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        
        if (!req.roles) throw new Unauthorized('You are not unauthorized to access this route')

        const roles = [...allowedRoles]
        const result = req.roles.map((role) => roles.includes(role)).filter(val => val === true)

        if (result.length < 1 || !result) {
            throw new Forbidden('You are not allowed to access this route')
        }

        next()
    }
}

module.exports = verifyRoles