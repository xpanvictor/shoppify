const mongoose = require('mongoose')


const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    }catch (err) {
        console.log(err)
    }
}

module.exports = connectDB