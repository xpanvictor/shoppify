const mongoose = require('mongoose')


const CartSchema = mongoose.Schema({
    
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    products: [{
        productId: {
            type: String,
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
}, { timestamps: true })


module.exports = mongoose.model('Cart', CartSchema)