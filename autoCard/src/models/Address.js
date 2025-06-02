const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street is required.'],
    trim: true,
  },
  apartmentOrSuite: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required.'],
    trim: true,
  },
  stateOrProvince: { // Renamed for clarity, can be 'state' or 'province'
    type: String,
    required: [true, 'State or Province is required.'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required.'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required.'],
    trim: true,
  },
  addressType: {
    type: String,
    enum: {
      values: ['home', 'work', 'other'],
      message: '{VALUE} is not a supported address type. Must be home, work, or other.',
    },
    default: 'home',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  // Example: User association (uncomment and adjust if User model exists and is needed)
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming a User model
  //   // required: true, // If an address must belong to a user
  // },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Indexing for frequently queried fields
addressSchema.index({ city: 1 });
addressSchema.index({ postalCode: 1 });
addressSchema.index({ country: 1, stateOrProvince: 1 }); // Compound index
// If user association is added:
// addressSchema.index({ user: 1 }); 

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
