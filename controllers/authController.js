const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register user
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // Check if user already exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        })

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        })
    } catch (error) {
        console.error('Register error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if user exists
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        })

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        console.error('Get profile error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Social login with Clerk
const socialLogin = async (req, res) => {
    try {
        console.log(
            'Social login requested with token:',
            req.body.token ? 'Token provided' : 'No token'
        )

        // The user is already authenticated and attached to req.user by the Clerk middleware
        const user = req.user

        if (!user) {
            return res.status(400).json({
                message:
                    'User not found in request. Middleware may have failed.'
            })
        }

        // Generate our own JWT token for internal use
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        })

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
            clerkId: user.clerkId
        })
    } catch (error) {
        console.error('Social login error:', error)
        res.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
}

module.exports = {
    register,
    login,
    getProfile,
    socialLogin
}
