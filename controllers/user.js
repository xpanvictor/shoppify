const { BadRequest, Forbidden, NotFound } = require("../errors")
const ROLES_LIST = require('../config/roles-list')
const { updateUserSchema } = require('../helpers/validation_schema')
const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")


const updateUser = async (req, res) => {
    const { id: userId } = req.params

    const validationResult = await updateUserSchema.validateAsync(req.body)

    if (!userId) throw new BadRequest('No id with the url')

    if (req.user?.id === userId || req.roles.includes(ROLES_LIST.Admin)) {

        if (validationResult.password) {
            validationResult.password = await bcryt.hash(validationResult.password, 10)
        }

        const result = await User.findByIdAndUpdate(userId, validationResult, { new: true, runValidators: true })

        if (!result) {
            throw new NotFound('No user with this id')
        }

        const { password, refreshToken, ...user } = result._doc

        return res.status(StatusCodes.OK).json(user)
    }

    throw new Forbidden('You are not allowed to access this resource')
}


const deleteUser = async (req, res) => {
    const { id: userId } = req.params

    if (!userId) throw new BadRequest('No id with the url')

    const result = await User.findByIdAndDelete(userId)

    return res.status(StatusCodes.OK).json({ message: 'User has been deleted' })
}


const getUser = async (req, res) => {
    const { id: userId } = req.params

    if (!userId) throw new BadRequest('No id with the url')

    const result = await User.findById(userId)

    if (!result) {
        throw new NotFound('No user found with this id')
    }

    const { password, refreshToken, ...user } = result._doc


    return res.status(StatusCodes.OK).json(user)
}


const getAllUsers = async (req, res) => {
    const { sort } = req.query
    
    let queryObj = {}

    let users = await User.find()

    if (sort) {
        const sortList = sort.split(',').join(' ')

        users = users.sort(sortList)
    }else {
        users = users.sort('createdAt')
    }

    return res.status(StatusCodes.OK).json(users)
}


const getUsersStats = async (req, res) => {
    console.log('creating date')
    const date = new Date()
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))
    console.log('created date')

    const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);

    return res.status(StatusCodes.OK).json(data)
}


module.exports = { 
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
    getUsersStats
}