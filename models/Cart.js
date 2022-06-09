const mongoose = require('mongoose')


const CartSchema = mongoose.Schema({
    
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a title']
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true })


module.exports = mongoose.model('Cart', CartSchema)