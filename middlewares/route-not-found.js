const { StatusCodes } = require("http-status-codes")


const routeNotFound = async (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).send('Rout not does not exist')
}

module.exports = routeNotFound