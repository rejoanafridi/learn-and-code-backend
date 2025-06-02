"use strict";
const express = require('express');
const router = express.Router();
const { createAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress, } = require('../controllers/addressController');
// Protect these routes later if user authentication is added
// const { protect } = require('../middleware/authMiddleware'); // Example
// Route for creating a new address and getting all addresses
router.route('/')
    // .post(protect, createAddress) // Example with auth
    // .get(protect, getAllAddresses);  // Example with auth
    .post(createAddress)
    .get(getAllAddresses);
// Route for getting, updating, and deleting a specific address by its ID
router.route('/:addressId')
    // .get(protect, getAddressById)    // Example with auth
    // .put(protect, updateAddress)     // Example with auth
    // .delete(protect, deleteAddress); // Example with auth
    .get(getAddressById)
    .put(updateAddress)
    .delete(deleteAddress);
module.exports = router;
//# sourceMappingURL=addressRoutes.js.map