require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./configs/db')
const tutorialRoutes = require('./routes/tutorials')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors())
app.use(express.json())
connectDB()

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')))

// API routes
app.use('/api/tutorials', tutorialRoutes)
app.use('/api/auth', authRoutes)

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'))
})

// Serve the tutorial upload page
app.get('/admin/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/upload.html'))
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
