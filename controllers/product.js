const { BadRequest, Forbidden, NotFound } = require("../errors")
const ROLES_LIST = require('../config/roles-list')
const Product = require("../models/Product")
const { productSchema } = require('../helpers/validation_schema')
const { StatusCodes } = require("http-status-codes")


const createProduct = async (req, res) => {
    const validationResult = await productSchema.validateAsync(req.body)

    const result = await Product.create(validationResult)

    return res.status(StatusCodes.OK).json(result)
}


module.exports = { 
    createProduct
}