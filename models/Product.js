const mongoose = require('mongoose')


const ProductSchema = mongoose.Schema({
    
    title: {
        type: String,
        required: [true, 'Please provide a title']
    },
    description: {
        type: String,
        required: [true, 'Provide a description'],
    },
    image: String,
    categories: { 
        type: Array
    },
    color: String,
    size: String,
    price: {
        type: Number,
        required: true
    }

}, { timestamps: true })


module.exports = mongoose.model('Product', ProductSchema)