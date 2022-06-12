const { StatusCodes } = require('http-status-codes')

const errorHandler = (err, req, res, next) => {

    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong, please try again later'
    }

    //Duplicate values error from mongoose
    if (err.code && err.code === 11000) {
        customError.message = `Duplicate value entered for ${Object.values(err.keyValue)} field`
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    //cast error for bad IDs from mongoose
    if (err.name === 'CastError') {
        customError.message = `No item found with id: ${err.value}`
        customError.statusCode = StatusCodes.NOT_FOUND
    }

    if (err.isJoi) {
        customError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    }

    return res.status(customError.statusCode).json({ message: customError.message })
}


module.exports = errorHandler