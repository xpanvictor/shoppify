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


module.exports = {
    registrationSchema,
    loginSchema
}