const mongoose = require('mongoose')

// Schema for translated content
const translationSchema = new mongoose.Schema(
    {
        language: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        sampleCode: {
            type: String,
            default: '// Sample code'
        }
    },
    { _id: false }
)

const tutorialSchema = new mongoose.Schema({
    // Default language (English) content
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    sampleCode: {
        type: String,
        default: '// Sample code'
    },
    // Default language (typically English)
    defaultLanguage: {
        type: String,
        default: 'english',
        trim: true,
        lowercase: true
    },
    // Translations in other languages
    translations: [translationSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Helper method to get tutorial in specific language
tutorialSchema.methods.getTranslation = function (language) {
    // Default to lowercase for consistency
    const requestedLanguage = language.toLowerCase()

    // If requested language is the default language, return the main content
    if (requestedLanguage === this.defaultLanguage) {
        return {
            _id: this._id,
            title: this.title,
            content: this.content,
            sampleCode: this.sampleCode,
            language: this.defaultLanguage,
            createdAt: this.createdAt
        }
    }

    // Find the requested translation
    const translation = this.translations.find(
        (t) => t.language === requestedLanguage
    )

    // If translation exists, return translated content
    if (translation) {
        return {
            _id: this._id,
            title: translation.title,
            content: translation.content,
            sampleCode: translation.sampleCode || this.sampleCode,
            language: translation.language,
            createdAt: this.createdAt
        }
    }

    // If no translation found, return default language
    return {
        _id: this._id,
        title: this.title,
        content: this.content,
        sampleCode: this.sampleCode,
        language: this.defaultLanguage,
        createdAt: this.createdAt
    }
}

module.exports = mongoose.model('Tutorial', tutorialSchema)
