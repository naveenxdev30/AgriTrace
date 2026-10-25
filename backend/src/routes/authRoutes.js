const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'agritrace_dev_secret_key_2025_change_in_production',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (admin or farmer)
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'farmer',
      phone = '',
      district,
      state,
      farmSizeAcres,
      cropsGrown,
      certificationStatus,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    let farmerProfile = null;
    if (role === 'farmer') {
      farmerProfile = await Farmer.create({
        name,
        contactPhone: phone || '9876543210',
        contactEmail: email.toLowerCase(),
        location: {
          address: req.body.address || 'Rural Agro Cluster',
          district: district || 'Nashik',
          state: state || 'Maharashtra',
        },
        farmSizeAcres: Number(farmSizeAcres) || 5,
        cropsGrown: Array.isArray(cropsGrown)
          ? cropsGrown
          : (cropsGrown || 'Wheat, Rice')
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean),
        certificationStatus: certificationStatus || 'Conventional Verified',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      farmerProfile: farmerProfile ? farmerProfile._id : null,
    });

    if (farmerProfile) {
      farmerProfile.user = user._id;
      await farmerProfile.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        farmerProfile: user.farmerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('farmerProfile');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        farmerProfile: user.farmerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('farmerProfile');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/demo-credentials
// @desc    Returns pre-seeded demo credentials for instant 1-click test login
// @access  Public
router.get('/demo-credentials', (req, res) => {
  res.json({
    success: true,
    accounts: [
      {
        role: 'admin',
        title: 'System Administrator',
        email: 'admin@agritrace.org',
        password: 'AdminPassword123!',
        description: 'Full system control, manage all farmers, verify batches, oversee all shipments & analytics',
      },
      {
        role: 'farmer',
        title: 'Registered Farmer (Ramesh Patil)',
        email: 'ramesh.patil@kisan.in',
        password: 'FarmerPassword123!',
        description: 'Manage harvested crops, create product batches, generate QR traceability codes',
      },
    ],
  });
});

module.exports = router;
