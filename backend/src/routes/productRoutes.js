const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');

// Helper to generate a unique batch ID if not provided
const generateBatchId = (cropName) => {
  const prefix = (cropName || 'PRD').substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AGT-${prefix}-${year}-${randomSuffix}`;
};

// Helper to generate QR code data URL
const generateQR = async (batchId) => {
  try {
    // Generate QR linking to client trace page (or relative URL for portable scanning)
    const traceUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/trace/${batchId}`;
    return await QRCode.toDataURL(traceUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#1b5e20',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
};

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public / Authenticated
router.get('/', async (req, res, next) => {
  try {
    const { category, farmerId, status, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (farmerId) {
      filter.farmer = farmerId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchId: { $regex: search, $options: 'i' } },
        { qualityGrade: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmer', 'name contactPhone location certificationStatus licenseNumber');

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:id
// @desc    Get product details by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name contactPhone contactEmail location certificationStatus farmSizeAcres licenseNumber');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found',
      });
    }

    // Also fetch shipments linked to this batch
    const shipments = await Shipment.find({ batchId: product.batchId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      product,
      shipments,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products
// @desc    Create a new product batch
// @access  Private (Admin or Farmer)
router.post('/', protect, async (req, res, next) => {
  try {
    let {
      name,
      category,
      farmer,
      quantity,
      unit = 'kg',
      pricePerUnit,
      harvestDate,
      expiryDate,
      batchId,
      storageConditions,
      qualityGrade,
      notes,
    } = req.body;

    if (!name || !quantity || pricePerUnit === undefined || !harvestDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, quantity, price per unit, and harvest date',
      });
    }

    // Determine farmer ID
    if (req.user.role === 'farmer') {
      if (!req.user.farmerProfile) {
        return res.status(400).json({
          success: false,
          message: 'No farmer profile associated with this user account',
        });
      }
      farmer = req.user.farmerProfile;
    } else {
      // Admin creating: verify provided farmer exists
      if (!farmer) {
        return res.status(400).json({
          success: false,
          message: 'Farmer selection is required for product batch',
        });
      }
    }

    const farmerDoc = await Farmer.findById(farmer);
    if (!farmerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Specified farmer could not be found',
      });
    }

    // Auto-generate batch ID if not provided
    const finalBatchId = (batchId && batchId.trim()) ? batchId.trim().toUpperCase() : generateBatchId(name);

    // Check if batch ID already exists
    const existing = await Product.findOne({ batchId: finalBatchId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Batch ID '${finalBatchId}' is already in use. Please use a unique batch ID.`,
      });
    }

    // Generate QR Code data URL
    const qrCodeDataUrl = await generateQR(finalBatchId);

    const product = await Product.create({
      name,
      category: category || 'Grains & Cereals',
      farmer,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      harvestDate: new Date(harvestDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      batchId: finalBatchId,
      storageConditions: storageConditions || 'Ambient temperature, dry ventilated warehouse',
      qualityGrade: qualityGrade || 'Grade A (Premium)',
      status: 'Harvested',
      qrCodeDataUrl,
      notes: notes || '',
    });

    const populatedProduct = await Product.findById(product._id).populate('farmer');

    res.status(201).json({
      success: true,
      message: 'Product batch created successfully',
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product batch
// @access  Private (Admin or Owner Farmer)
router.put('/:id', protect, async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found',
      });
    }

    // Authorization check
    if (req.user.role === 'farmer') {
      if (
        !req.user.farmerProfile ||
        product.farmer.toString() !== req.user.farmerProfile.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit products belonging to your farm',
        });
      }
    }

    const {
      name,
      category,
      farmer,
      quantity,
      unit,
      pricePerUnit,
      harvestDate,
      expiryDate,
      storageConditions,
      qualityGrade,
      status,
      notes,
    } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (farmer && req.user.role === 'admin') product.farmer = farmer;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unit) product.unit = unit;
    if (pricePerUnit !== undefined) product.pricePerUnit = Number(pricePerUnit);
    if (harvestDate) product.harvestDate = new Date(harvestDate);
    if (expiryDate !== undefined) product.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (storageConditions !== undefined) product.storageConditions = storageConditions;
    if (qualityGrade) product.qualityGrade = qualityGrade;
    if (status) product.status = status;
    if (notes !== undefined) product.notes = notes;

    // Refresh QR code if not present
    if (!product.qrCodeDataUrl) {
      product.qrCodeDataUrl = await generateQR(product.batchId);
    }

    await product.save();
    const updated = await Product.findById(product._id).populate('farmer');

    res.json({
      success: true,
      message: 'Product batch updated successfully',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product batch
// @access  Private (Admin or Owner Farmer)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product batch not found',
      });
    }

    if (req.user.role === 'farmer') {
      if (
        !req.user.farmerProfile ||
        product.farmer.toString() !== req.user.farmerProfile.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own products',
        });
      }
    }

    // Check for active shipments
    const activeShipments = await Shipment.countDocuments({
      batchId: product.batchId,
      status: { $in: ['Pending', 'In Transit'] },
    });

    if (activeShipments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch '${product.batchId}'. There are ${activeShipments} active shipments linked to it.`,
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product batch removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
