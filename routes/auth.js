const express = require('express')
const router = express.Router()
const {
    register,
    login,
    getProfile,
    socialLogin
} = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')
const clerkAuthMiddleware = require('../middleware/clerkAuth')
const { createClerkClient, verifyToken } = require('@clerk/backend')

// Regular authentication routes
router.post('/register', register)
router.post('/login', login)
router.get('/profile', authMiddleware, getProfile)

// Social login with Clerk
router.post('/social-login', clerkAuthMiddleware, socialLogin)

// Debug endpoint to verify token
router.post('/verify-token', async (req, res) => {
    try {
        const token = req.body.token

        if (!token) {
            return res.status(400).json({ message: 'No token provided' })
        }

        try {
            const sessionClaims = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            })

            return res.status(200).json({
                message: 'Token is valid',
                userId: sessionClaims.sub,
                claims: sessionClaims
            })
        } catch (error) {
            return res.status(401).json({
                message: 'Invalid token',
                error: error.message
            })
        }
    } catch (error) {
        console.error('Token verification error:', error)
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
})

module.exports = router
