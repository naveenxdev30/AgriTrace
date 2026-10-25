const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/farmers
// @desc    Get all farmers with optional search and filters
// @access  Public or Authenticated
router.get('/', async (req, res, next) => {
  try {
    const { search, crop, certification } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (crop) {
      filter.cropsGrown = { $regex: crop, $options: 'i' };
    }

    if (certification && certification !== 'All') {
      filter.certificationStatus = certification;
    }

    const farmers = await Farmer.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'email role');

    // Attach count of products for each farmer
    const farmerIds = farmers.map((f) => f._id);
    const productCounts = await Product.aggregate([
      { $match: { farmer: { $in: farmerIds } } },
      { $group: { _id: '$farmer', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((pc) => {
      countMap[pc._id.toString()] = pc.count;
    });

    const enrichedFarmers = farmers.map((f) => {
      const obj = f.toObject();
      obj.productCount = countMap[f._id.toString()] || 0;
      return obj;
    });

    res.json({
      success: true,
      count: enrichedFarmers.length,
      farmers: enrichedFarmers,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/farmers/:id
// @desc    Get single farmer details with products
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id).populate('user', 'email role');
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    const products = await Product.find({ farmer: farmer._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      farmer,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/farmers
// @desc    Create a new farmer
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const {
      name,
      contactPhone,
      contactEmail,
      location,
      farmSizeAcres,
      cropsGrown,
      certificationStatus,
      licenseNumber,
      notes,
    } = req.body;

    if (!name || !contactPhone || !farmSizeAcres) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact phone, and farm size (acres) are required',
      });
    }

    const cropsArray = Array.isArray(cropsGrown)
      ? cropsGrown
      : typeof cropsGrown === 'string'
      ? cropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const farmer = await Farmer.create({
      name,
      contactPhone,
      contactEmail: contactEmail || '',
      location: {
        address: location?.address || '',
        district: location?.district || 'Central District',
        state: location?.state || 'Agricultural Belt',
      },
      farmSizeAcres: Number(farmSizeAcres),
      cropsGrown: cropsArray,
      certificationStatus: certificationStatus || 'Conventional Verified',
      licenseNumber: licenseNumber || undefined,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      farmer,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/farmers/:id
// @desc    Update farmer record
// @access  Private (Admin or linked farmer)
router.put('/:id', protect, async (req, res, next) => {
  try {
    let farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    // Authorization: Admin can update any farmer; farmer can update their own profile
    if (
      req.user.role !== 'admin' &&
      (!farmer.user || farmer.user.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own farmer profile',
      });
    }

    const {
      name,
      contactPhone,
      contactEmail,
      location,
      farmSizeAcres,
      cropsGrown,
      certificationStatus,
      licenseNumber,
      notes,
    } = req.body;

    if (name) farmer.name = name;
    if (contactPhone) farmer.contactPhone = contactPhone;
    if (contactEmail !== undefined) farmer.contactEmail = contactEmail;
    if (location) {
      farmer.location = {
        address: location.address !== undefined ? location.address : farmer.location.address,
        district: location.district !== undefined ? location.district : farmer.location.district,
        state: location.state !== undefined ? location.state : farmer.location.state,
      };
    }
    if (farmSizeAcres) farmer.farmSizeAcres = Number(farmSizeAcres);
    if (cropsGrown !== undefined) {
      farmer.cropsGrown = Array.isArray(cropsGrown)
        ? cropsGrown
        : cropsGrown.split(',').map((c) => c.trim()).filter(Boolean);
    }
    if (certificationStatus && req.user.role === 'admin') {
      farmer.certificationStatus = certificationStatus;
    }
    if (licenseNumber && req.user.role === 'admin') {
      farmer.licenseNumber = licenseNumber;
    }
    if (notes !== undefined) farmer.notes = notes;

    await farmer.save();

    res.json({
      success: true,
      message: 'Farmer updated successfully',
      farmer,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/farmers/:id
// @desc    Delete farmer record
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
    }

    // Check if farmer has dependent products
    const productCount = await Product.countDocuments({ farmer: farmer._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete farmer. There are ${productCount} product batches linked to this farmer. Please reassign or remove them first.`,
      });
    }

    await Farmer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Farmer record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
