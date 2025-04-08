require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./configs/db')
const tutorialRoutes = require('./routes/tutorials')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors())
app.use(express.json())
connectDB()

app.use('/api/tutorials', tutorialRoutes)
app.use('/api/auth', authRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
