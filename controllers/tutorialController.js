const Tutorial = require('../models/Tutorials')
const User = require('../models/User')

// @desc    Get all tutorials with language support
// @route   GET /api/tutorials
// @access  Public
const getTutorials = async (req, res) => {
    try {
        // Get language from query params, default to English
        const language = req.query.language?.toLowerCase() || 'en'

        const tutorials = await Tutorial.find().sort({ createdAt: -1 })

        // Transform tutorials to requested language
        const translatedTutorials = tutorials.map((tutorial) => {
            return tutorial.getTranslation(language)
        })

        res.status(200).json(translatedTutorials)
    } catch (error) {
        console.error('Error fetching tutorials:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Get single tutorial with language support
// @route   GET /api/tutorials/:id
// @access  Public
const getTutorial = async (req, res) => {
    try {
        // Get language from query params, default to English
        const language = req.query.language?.toLowerCase() || 'english'

        const tutorial = await Tutorial.findById(req.params.id)

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        // Get tutorial in requested language
        const translatedTutorial = tutorial.getTranslation(language)

        res.status(200).json(translatedTutorial)
    } catch (error) {
        console.error('Error fetching tutorial:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Add a translation to a tutorial
// @route   POST /api/tutorials/:id/translate
// @access  Private (Admin or Authorized Users)
const addTranslation = async (req, res) => {
    try {
        const { language, title, content, sampleCode } = req.body

        // Validation
        if (!language || !title || !content) {
            return res.status(400).json({
                message:
                    'Please provide language, title, and content for translation'
            })
        }

        // Find tutorial
        const tutorial = await Tutorial.findById(req.params.id)

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        // Check if translation already exists
        const existingTranslationIndex = tutorial.translations.findIndex(
            (t) => t.language.toLowerCase() === language.toLowerCase()
        )

        if (existingTranslationIndex !== -1) {
            // Update existing translation
            tutorial.translations[existingTranslationIndex] = {
                language: language.toLowerCase(),
                title,
                content,
                sampleCode: sampleCode || tutorial.sampleCode
            }
        } else {
            // Add new translation
            tutorial.translations.push({
                language: language.toLowerCase(),
                title,
                content,
                sampleCode: sampleCode || tutorial.sampleCode
            })
        }

        await tutorial.save()

        res.status(200).json({
            message: `Translation for ${language} added/updated successfully`,
            tutorial
        })
    } catch (error) {
        console.error('Error adding translation:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Create a tutorial with optional translations
// @route   POST /api/tutorials
// @access  Private (Admin or Authorized Users)
const createTutorial = async (req, res) => {
    try {
        const { title, content, sampleCode, defaultLanguage, translations } =
            req.body

        // Validation
        if (!title || !content) {
            return res
                .status(400)
                .json({ message: 'Please provide title and content' })
        }

        // Create tutorial data
        const tutorialData = {
            title,
            content,
            sampleCode: sampleCode || '// Sample code',
            defaultLanguage: defaultLanguage?.toLowerCase() || 'english'
        }

        // Add translations if provided
        if (
            translations &&
            Array.isArray(translations) &&
            translations.length > 0
        ) {
            // Validate and format each translation
            const formattedTranslations = translations.map((translation) => ({
                language: translation.language.toLowerCase(),
                title: translation.title,
                content: translation.content,
                sampleCode: translation.sampleCode || tutorialData.sampleCode
            }))

            tutorialData.translations = formattedTranslations
        }

        // Create tutorial
        const tutorial = await Tutorial.create(tutorialData)

        res.status(201).json(tutorial)
    } catch (error) {
        console.error('Error creating tutorial:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Update a tutorial
// @route   PUT /api/tutorials/:id
// @access  Private (Admin or Authorized Users)
const updateTutorial = async (req, res) => {
    try {
        const { title, content, sampleCode } = req.body

        // Find tutorial
        let tutorial = await Tutorial.findById(req.params.id)

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        // Update tutorial
        tutorial = await Tutorial.findByIdAndUpdate(
            req.params.id,
            { title, content, sampleCode },
            { new: true, runValidators: true }
        )

        res.status(200).json(tutorial)
    } catch (error) {
        console.error('Error updating tutorial:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Delete a tutorial
// @route   DELETE /api/tutorials/:id
// @access  Private (Admin)
const deleteTutorial = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id)

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        await tutorial.deleteOne()

        res.status(200).json({ message: 'Tutorial removed' })
    } catch (error) {
        console.error('Error deleting tutorial:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Bulk upload tutorials
// @route   POST /api/tutorials/bulk
// @access  Private (Admin)
const bulkUploadTutorials = async (req, res) => {
    try {
        const { tutorials } = req.body

        if (!tutorials || !Array.isArray(tutorials) || tutorials.length === 0) {
            return res
                .status(400)
                .json({ message: 'Please provide an array of tutorials' })
        }

        // Validate each tutorial
        for (const tutorial of tutorials) {
            if (!tutorial.title || !tutorial.content) {
                return res.status(400).json({
                    message: 'Each tutorial must have a title and content',
                    invalidTutorial: tutorial
                })
            }

            // Validate translations if provided
            if (tutorial.translations) {
                if (!Array.isArray(tutorial.translations)) {
                    return res.status(400).json({
                        message: 'Translations must be an array',
                        invalidTutorial: tutorial
                    })
                }

                for (const translation of tutorial.translations) {
                    if (
                        !translation.language ||
                        !translation.title ||
                        !translation.content
                    ) {
                        return res.status(400).json({
                            message:
                                'Each translation must have language, title, and content',
                            invalidTranslation: translation,
                            invalidTutorial: tutorial
                        })
                    }
                }
            }
        }

        // Format tutorials to ensure proper structure
        const formattedTutorials = tutorials.map((tutorial) => {
            const formattedTutorial = {
                title: tutorial.title,
                content: tutorial.content,
                sampleCode: tutorial.sampleCode || '// Sample code',
                defaultLanguage:
                    tutorial.defaultLanguage?.toLowerCase() || 'english'
            }

            // Add translations if provided
            if (
                tutorial.translations &&
                Array.isArray(tutorial.translations) &&
                tutorial.translations.length > 0
            ) {
                formattedTutorial.translations = tutorial.translations.map(
                    (translation) => ({
                        language: translation.language.toLowerCase(),
                        title: translation.title,
                        content: translation.content,
                        sampleCode:
                            translation.sampleCode ||
                            formattedTutorial.sampleCode
                    })
                )
            }

            return formattedTutorial
        })

        // Insert tutorials
        const createdTutorials = await Tutorial.insertMany(formattedTutorials)

        res.status(201).json({
            message: `Successfully uploaded ${createdTutorials.length} tutorials`,
            tutorials: createdTutorials
        })
    } catch (error) {
        console.error('Error bulk uploading tutorials:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Mark tutorial as completed
// @route   POST /api/tutorials/:id/complete
// @access  Private
const completeTutorial = async (req, res) => {
    try {
        const tutorialId = req.params.id

        // Check if tutorial exists
        const tutorial = await Tutorial.findById(tutorialId)
        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        // Find user
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Check if tutorial is already marked as completed
        if (user.completedTutorials.includes(tutorialId)) {
            return res
                .status(400)
                .json({ message: 'Tutorial already marked as completed' })
        }

        // Add tutorial to user's completed tutorials
        user.completedTutorials.push(tutorialId)
        await user.save()

        res.status(200).json({
            message: 'Tutorial marked as completed',
            completedTutorials: user.completedTutorials
        })
    } catch (error) {
        console.error('Error marking tutorial as completed:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// @desc    Get available languages for a tutorial
// @route   GET /api/tutorials/:id/languages
// @access  Public
const getTutorialLanguages = async (req, res) => {
    try {
        const tutorial = await Tutorial.findById(req.params.id)

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' })
        }

        // Get all available languages
        const languages = [
            tutorial.defaultLanguage,
            ...tutorial.translations.map((t) => t.language)
        ]

        res.status(200).json({
            defaultLanguage: tutorial.defaultLanguage,
            availableLanguages: languages
        })
    } catch (error) {
        console.error('Error fetching tutorial languages:', error)
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

module.exports = {
    getTutorials,
    getTutorial,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    bulkUploadTutorials,
    completeTutorial,
    addTranslation,
    getTutorialLanguages
}
