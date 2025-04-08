const Tutorial = require('../models/Tutorials')
const User = require('../models/User')

// Get all tutorials
exports.getTutorials = async (req, res, next) => {
    try {
        const tutorials = await Tutorial.find().select('title _id')
        res.status(200).json(tutorials)
    } catch (error) {
        next(error) // Pass to error middleware
    }
}

// Get a single tutorial by ID
exports.getTutorialById = async (req, res, next) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id)
        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }
        res.status(200).json(tutorial)
    } catch (error) {
        next(error)
    }
}

// Create a tutorial (for testing or admin use)
exports.createTutorial = async (req, res, next) => {
    try {
        const { title, content, sampleCode } = req.body
        const tutorial = new Tutorial({ title, content, sampleCode })
        await tutorial.save()
        res.status(201).json(tutorial)
    } catch (error) {
        next(error)
    }
}

// Mark tutorial as completed
exports.completeTutorial = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        const tutorialId = req.params.id

        if (!user.completedTutorials.includes(tutorialId)) {
            user.completedTutorials.push(tutorialId)
            await user.save()
        }
        res.status(200).json({ message: 'Tutorial marked as completed' })
    } catch (error) {
        next(error)
    }
}
