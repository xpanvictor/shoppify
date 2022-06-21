const { BadRequest, Forbidden, NotFound } = require("../errors")
const ROLES_LIST = require('../config/roles-list')
const Product = require("../models/Product")
const { productSchema, updateProductSchema } = require('../helpers/validation_schema')
const { StatusCodes } = require("http-status-codes")


const createProduct = async (req, res) => {
    const validationResult = await productSchema.validateAsync(req.body)

    const result = await Product.create(validationResult)

    return res.status(StatusCodes.OK).json(result)
}


const updateProduct = async (req, res) => {
    const { id: productId } = req.params

    const validationResult = await updateProductSchema.validateAsync(req.body)

    if (!productId) throw new BadRequest('No id provided with url')

    const updatedProduct = await Product.findByIdAndUpdate(productId, validationResult, { new: true, runValidators: true })

    return res.status(StatusCodes.OK).json(updateProduct)
}


const deleteProduct = async (req, res) => {
    const { id: productId } = req.params

    if (!productId) throw new BadRequest('No id provided with url')

    const result = await Product.findByIdAndDelete(productId)

    return res.status(StatusCodes.OK).json({ message: "Product deleted" })
}


const getProduct = async (req, res) => {
    const { id: productId } = req.params

    if (!productId) throw new BadRequest('No id provided with url')

    const result = await Product.findById(productId)

    return res.status(StatusCodes.OK).json(result)
}


const getAllProducts = async (req, res) => {
    const { title, color, size, sort, fields, numericFilters, categories } = req.query

    let queryObject = {}


    if (title) {
        queryObject.title = { $regex: title, $options: 'i' }
    }

    if (categories) {
        queryObject.categories = categories
    }

    if (color) {
        queryObject.color = color
    }

    if (size) {
        queryObject.size = size
    }

    if (numericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte'
        }

        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)

        const options = ['price', 'rating']
        filters = filters.split(',').forEach(item => {
            const [field, operator, price] = item.split('-')

            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(price) }
            }
        })
    }

    let result = Product.find(queryObject)

    if (sort) {
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    }else {
        result = result.sort('createdAt')
    }

    if (fields) {
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    result = result.skip(skip).limit(limit)
    const products = await result
    return res.status(StatusCodes.OK).json({ products, nbHits: products.length })
}


module.exports = { 
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getAllProducts
}