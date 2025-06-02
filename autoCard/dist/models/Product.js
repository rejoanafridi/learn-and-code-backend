"use strict";
const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required.'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Product price is required.'],
        min: [0, 'Price cannot be negative.'],
    },
    category: {
        type: String,
        trim: true,
        default: 'General',
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative.'],
        // Validate that stock is an integer if necessary, Mongoose handles number type.
        // validate: {
        //   validator: Number.isInteger,
        //   message: '{VALUE} is not an integer value for stock.'
        // }
    },
    sku: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents to have a null SKU, but unique if present
        trim: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
// Indexing common query fields can improve performance
productSchema.index({ name: 'text', description: 'text' }); // For text search if needed
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
//# sourceMappingURL=Product.js.map