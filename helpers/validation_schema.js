const Joi = require('joi')


const registrationSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    username: Joi.string().lowercase().min(3).required(),
    password: Joi.string().min(8).required()
})


const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
})


const updateUserSchema = Joi.object({
    email: Joi.string().email().lowercase(),
    username: Joi.string().lowercase().min(3),
    password: Joi.string().min(8),
    roles: Joi.object()
})


const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    categories: Joi.array(),
    color: Joi.string(),
    size: Joi.string(),
    price: Joi.number().required()
})


const updateProductSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
    categories: Joi.array(),
    color: Joi.string(),
    size: Joi.string(),
    price: Joi.number()
})


const orderSchema = Joi.object({
    userId: Joi.string(),
    products: Joi.array().required(),
    amount: Joi.number().required(),
    address: Joi.object(),
    status: Joi.string()
})


module.exports = {
    registrationSchema,
    loginSchema,
    updateUserSchema,
    productSchema,
    updateProductSchema,
    orderSchema
}