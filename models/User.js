const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.clerkId
        }, // Only required if not using Clerk
        minlength: 6
    },
    username: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    clerkId: {
        type: String,
        unique: true,
        sparse: true // Allows the field to be null for regular users
    },
    completedTutorials: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutorial'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)
