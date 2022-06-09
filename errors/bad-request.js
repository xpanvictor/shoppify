const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('./custom')


class BadRequest extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCode = StatusCodes.BadRequest
    }
}


module.exports = BadRequest