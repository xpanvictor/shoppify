const mongoose = require('mongoose')


const UserSchema = mongoose.Schema({
    
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide an email']
    },
    username: {
        type: String,
        required: [true, 'Username must be provided'],
        trim: true,
        unique: true
    },
    roles: {
        User: {
            type: Number,
            default: 1985
        },
        Moderator: Number,
        Admin: Number
    },
    password: {
        type: String
    },
    refreshToken: [String]

}, { timestamps: true })


module.exports = mongoose.model('User', UserSchema)