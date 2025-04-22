const { createClerkClient, verifyToken } = require('@clerk/backend')
const User = require('../models/User')

// Initialize Clerk client
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
console.log(clerk, 'clerk')
const verifyClerkToken = async (req, res, next) => {
    try {
        // Get token from request body or authorization header
        const token = req.body.token || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }

        // Verify the token with Clerk's standalone function
        try {
            const sessionClaims = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY
            })

            if (!sessionClaims) {
                return res.status(401).json({ message: 'Invalid token' })
            }

            const userId = sessionClaims.sub

            try {
                const clerkUser = await clerk.users.getUser(userId)

                if (!clerkUser) {
                    return res.status(401).json({ message: 'User not found' })
                }

                // Get primary email
                const primaryEmail = clerkUser.emailAddresses.find(
                    (email) => email.id === clerkUser.primaryEmailAddressId
                )?.emailAddress

                if (!primaryEmail) {
                    return res
                        .status(400)
                        .json({ message: 'Email not found on clerk user' })
                }

                // Check if user exists in our database
                let user = await User.findOne({ clerkId: userId })

                // If user doesn't exist, create a new one
                if (!user) {
                    user = await User.create({
                        clerkId: userId,
                        email: primaryEmail,
                        username:
                            clerkUser.username || primaryEmail.split('@')[0],
                        firstName: clerkUser.firstName || '',
                        lastName: clerkUser.lastName || ''
                    })
                }

                // Add user to request object
                req.user = user
                next()
            } catch (error) {
                console.error('Error getting user:', error)
                return res.status(401).json({
                    message: 'Error retrieving user data',
                    clerkUserId: userId
                })
            }
        } catch (error) {
            console.error('Token verification failed:', error)
            return res.status(401).json({
                message: 'Token verification failed',
                error: error.message
            })
        }
    } catch (error) {
        console.error('Clerk token verification error:', error)
        return res.status(401).json({
            message: 'Authentication failed',
            error: error.message
        })
    }
}

module.exports = verifyClerkToken
