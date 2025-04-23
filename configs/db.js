const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        mongoose
            .connect(process.env.MONGO_URI)
            .then(() => console.log('MongoDB connected'))
            .catch((err) => console.error('MongoDB connection error:', err))

        console.log('MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection error:', error.message)
        process.exit(1)
    }
}

module.exports = connectDB
