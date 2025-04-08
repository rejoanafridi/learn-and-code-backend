const express = require('express')
const router = express.Router()
const {
    getTutorials,
    getTutorialById,
    createTutorial,
    completeTutorial
} = require('../controllers/tutorialController')

const authMiddleware = require('../middleware/auth')

router.get('/', getTutorials)
router.get('/:id', getTutorialById)
router.post('/', createTutorial)

router.post('/:id/complete', authMiddleware, completeTutorial)

module.exports = router
