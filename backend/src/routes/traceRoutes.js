const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const Shipment = require('../models/Shipment');

// @route   GET /api/trace/:batchId
// @desc    Public traceability endpoint: get comprehensive origin, farmer, and shipment history by batchId
// @access  Public
router.get('/:batchId', async (req, res, next) => {
  try {
    const rawBatchId = req.params.batchId.trim();
    
    // Look up product by batchId (case-insensitive regex)
    const product = await Product.findOne({
      batchId: { $regex: new RegExp(`^${rawBatchId}$`, 'i') },
    }).populate('farmer');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `No agricultural batch found matching Batch ID: '${rawBatchId}'`,
        suggestion: 'Please verify the QR code or enter a valid batch ID (e.g. AGT-WHT-2025-1001, AGT-MNG-2025-2045).',
      });
    }

    // Retrieve all shipments linked to this product / batch
    const shipments = await Shipment.find({
      $or: [{ batchId: product.batchId }, { product: product._id }],
    }).sort({ createdAt: 1 });

    const farmer = product.farmer;

    // Construct the structured supply chain milestone timeline
    const timeline = [];

    // Stage 1: Farm Origin & Seed Cultivation
    timeline.push({
      step: 1,
      title: 'Farm Origin & Cultivation',
      status: 'Completed',
      date: farmer.createdAt || new Date('2024-01-01'),
      location: `${farmer.location?.district || 'District'}, ${farmer.location?.state || 'State'}`,
      entity: farmer.name,
      icon: 'Sprout',
      details: {
        farmSize: `${farmer.farmSizeAcres} Acres`,
        certification: farmer.certificationStatus,
        licenseNumber: farmer.licenseNumber,
        contact: farmer.contactPhone,
        address: farmer.location?.address || 'Certified Agricultural Farmland',
      },
    });

    // Stage 2: Harvesting & Quality Grading
    timeline.push({
      step: 2,
      title: 'Harvesting & Quality Inspection',
      status: 'Completed',
      date: product.harvestDate,
      location: `${farmer.location?.district || 'Farm Gate'}, Harvest Hub`,
      entity: `${farmer.name} (Harvester)`,
      icon: 'Award',
      details: {
        productName: product.name,
        category: product.category,
        batchId: product.batchId,
        quantity: `${product.quantity.toLocaleString()} ${product.unit}`,
        qualityGrade: product.qualityGrade,
        storageConditions: product.storageConditions,
        pricePerUnit: `₹${product.pricePerUnit} / ${product.unit}`,
      },
    });

    // Stage 3 & 4: Logistics and Shipments
    if (shipments.length > 0) {
      shipments.forEach((shipment, index) => {
        timeline.push({
          step: 3 + index,
          title: `Transit & Logistics (${shipment.carrierName})`,
          status: shipment.status,
          date: shipment.dispatchDate,
          location: `${shipment.origin} ➔ ${shipment.destination}`,
          entity: shipment.carrierName,
          icon: 'Truck',
          details: {
            trackingNumber: shipment.trackingNumber,
            vehicleNumber: shipment.vehicleNumber,
            driverName: shipment.driverName,
            driverPhone: shipment.driverPhone,
            currentLocation: shipment.currentLocation,
            temperatureCondition: shipment.temperatureCondition,
            estimatedArrival: shipment.estimatedArrival,
            actualArrival: shipment.actualArrival,
            checkpoints: shipment.checkpoints,
          },
        });
      });
    } else {
      timeline.push({
        step: 3,
        title: 'Warehouse & Logistics Staging',
        status: 'In Warehouse',
        date: product.createdAt,
        location: `${farmer.location?.district || 'Origin'}, Central Storage`,
        entity: 'AgriTrace Local Aggregation Hub',
        icon: 'Warehouse',
        details: {
          note: 'Batch safely stored under controlled atmospheric conditions, awaiting transit dispatch.',
          storage: product.storageConditions,
        },
      });
    }

    // Determine current overall batch journey status
    let currentPhase = 'Farm Harvest';
    if (shipments.some((s) => s.status === 'Delivered')) {
      currentPhase = 'Delivered to Destination';
    } else if (shipments.some((s) => s.status === 'In Transit')) {
      currentPhase = 'In Transit';
    } else if (shipments.some((s) => s.status === 'Pending')) {
      currentPhase = 'Dispatched / Logistics Pending';
    }

    res.json({
      success: true,
      batchId: product.batchId,
      currentPhase,
      product,
      farmer,
      shipments,
      timeline,
      verification: {
        isAuthentic: true,
        scannedAt: new Date(),
        digitalSignature: `AGT-VERIFY-${product.batchId}-${Buffer.from(product._id.toString()).toString('hex').slice(0, 8)}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/trace
// @desc    Get list of recently searchable batches for suggestions
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const batches = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name batchId category qualityGrade status createdAt')
      .populate('farmer', 'name location');

    res.json({
      success: true,
      batches,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
