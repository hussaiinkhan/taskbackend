const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler= require('express-async-handler')
const validator = require('validator');
const getCoordinates = require('../utils/geocode');
const upload = require('../middlewares/upload')
const Admin = require('../models/adminModel');
const Ad = require('../models/adModel');
const authMiddleware = require('../middlewares/authHandler');
const config = require('../config/config');

const router = express.Router();

//@desc Create new admin
//@route POST /api/admin
//@access public

router.post('/register', asyncHandler(async (req, res) => {
  const { name, surname, phone, password } = req.body;

  // Validate phone number
  if (!validator.isMobilePhone(phone, 'any')) {
    return res.status(400).json({ msg: 'Invalid phone number' });
  }
  try {
    let admin = await Admin.findOne({ phone });
    if (admin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }
    admin = new Admin({ name, surname, phone, password });
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    await admin.save();
    res.send('Admin registered');
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

//@desc Login Admin
//@route POST /api/admin
//@access public

router.post('/login', asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  try {
    let admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { admin: { id: admin.id } };
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

// CRUD operations for ads

router.post('/ads', asyncHandler(async (req, res) => {
  console.log(req);
  const { ad_title, area, price, image, description, is_rent } = req.body;
  const user_id = req.admin.id

  try {
    const coordinates = await getCoordinates(area);
    if (!coordinates) {
      return res.status(400).json({ msg: 'Unable to get coordinates for the provided address' });
    }

    const newAd = new Ad({ ad_title, price, area: coordinates, description, is_rent, image,user_id});
    const ad = await newAd.save();
    res.json(ad);
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

router.get('/ads', asyncHandler(async (req, res) => {
  try {
    const ads = await Ad.find({user_id:req.admin.id});
    res.json(ads);
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

router.put('/ads/:id', asyncHandler(async (req, res) => {
  const { ad_title, area, description, price, is_rent, image } = req.body;
  try {
    let ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ msg: 'Ad not found' });

    ad.ad_title = ad_title || ad.ad_title;
    ad.area = area || ad.area;
    ad.price = price || ad.price;
    ad.description = description || ad.description;
    ad.is_rent = is_rent !== undefined ? is_rent : ad.is_rent;
    ad.image = image || ad.image;

    await ad.save();
    res.json(ad);
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

router.delete('/ads/:id', asyncHandler(async (req, res) => {
  try {
    await Ad.deleteOne({ _id: req.params.id });
    res.send('Ad removed');
  } catch (err) {
    res.status(500).send('Server error');
  }
}));

module.exports = router;
