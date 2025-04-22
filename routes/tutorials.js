const express = require('express')
const router = express.Router()
const {
    getTutorials,
    getTutorial,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    bulkUploadTutorials,
    completeTutorial,
    addTranslation,
    getTutorialLanguages
} = require('../controllers/tutorialController')

const authMiddleware = require('../middleware/auth')

// Public routes
router.get('/', getTutorials)

// Get available languages for a tutorial
router.get('/:id/languages', getTutorialLanguages)

// Protected bulk upload route (should come before /:id routes)
router.post('/bulk', authMiddleware, bulkUploadTutorials)

// Translation route
router.post('/:id/translate', authMiddleware, addTranslation)

// Individual tutorial routes
router.get('/:id', getTutorial)
router.put('/:id', authMiddleware, updateTutorial)
router.delete('/:id', authMiddleware, deleteTutorial)
router.post('/:id/complete', authMiddleware, completeTutorial)

// Create new tutorial
router.post('/', authMiddleware, createTutorial)

module.exports = router
