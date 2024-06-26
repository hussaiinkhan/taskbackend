const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler= require('express-async-handler')
const validator = require('validator');
const Customer = require('../models/customerModel');
const Ad = require('../models/adModel');
const authMiddleware = require('../middlewares/authHandler');
const config = require('../config/config');

const router = express.Router();

// Register customer
router.post('/register', asyncHandler(async (req, res) => {
  const { name, surname, budget, phone, password } = req.body;

  // Validate phone number
  if (!validator.isMobilePhone(phone, 'any')) {
    return res.status(400).json({ msg: 'Invalid phone number' });
  }

  try {
    let customer = await Customer.findOne({ phone });
    if (customer) {
      return res.status(400).json({ msg: 'Customer already exists' });
    }
    customer = new Customer({ name, surname, budget, phone, password });
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(password, salt);
    await customer.save();
    res.send('Customer registered');
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

// Login customer
router.post('/login', asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  try {
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { customer: { id: customer.id } };
    jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

// Middleware to protect routes
router.use(authMiddleware);

//getting ads for displa7
router.get('/ads', asyncHandler(async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

//Getting budget variable from backend
// 
router.get('/budget',  asyncHandler(async (req, res) => {
  try {
    // Assuming the client's budget is stored in the user profile or related document
    const client = await Customer.findById(req.customer.id); // Adjust this based on your schema
    
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }
    
    // Assuming budget is stored in a field called 'budget' in the user document
    const budget = client.budget;
    res.json({ budget });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}));

//Making changes to database after successful renting

router.post('/ads/:id/rent', asyncHandler(async (req, res) => {
  try {
    const adId = req.params.id;
    const userId = req.customer.id; // Assuming user ID is available in req.user

    // Perform database update to mark the ad as rented
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ msg: 'Ad not found' });
    }

    ad.is_rent = 'true'; // Example field to mark ad as rented
    await ad.save();

    // Optionally, update user's budget or transaction history
    // Example: Reduce user's budget after renting
    const user = await Customer.findById(userId);
    if (user) {
      user.budget -= ad.price; // Example deduction from user's budget
      await user.save();
    }

    // Return success response
    res.json({ msg: 'Property rented successfully' });
  } catch (err) {
    console.error('Error renting property:', err);
    res.status(500).send('Server error');
  }
}));


// List ads with filtering and sorting
router.get('/ads/sorted', asyncHandler(async (req, res) => {
  const { latitude, longitude, sort } = req.query;
  let filter = {};
  if (latitude && longitude) {
    filter = {
      'area.latitude': latitude,
      'area.longitude': longitude,
    };
  }
  try {
    let ads = await Ad.find(filter);
    if (sort) {
      ads = ads.sort((a, b) => (a[sort] > b[sort] ? 1 : -1));
    }
    res.json(ads);
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

module.exports = router;
