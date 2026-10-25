const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const { protect } = require('../middleware/auth');

// Generate unique tracking number e.g. "SHP-781920"
const generateTrackingNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SHP-${random}`;
};

// @route   GET /api/shipments
// @desc    Get all shipments with status filter and search
// @access  Public / Authenticated
router.get('/', async (req, res, next) => {
  try {
    const { status, batchId, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (batchId) {
      filter.batchId = batchId.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { batchId: { $regex: search, $options: 'i' } },
        { carrierName: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
      ];
    }

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .populate('product', 'name category qualityGrade batchId')
      .populate('farmer', 'name contactPhone location');

    res.json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/shipments/:id
// @desc    Get shipment details by ID
// @access  Public / Authenticated
router.get('/:id', async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('product')
      .populate('farmer');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    res.json({
      success: true,
      shipment,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/shipments
// @desc    Create a new shipment
// @access  Private (Admin or Farmer)
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      product: productId,
      quantity,
      carrierName,
      vehicleNumber,
      driverName,
      driverPhone,
      origin,
      destination,
      estimatedArrival,
      temperatureCondition,
      notes,
    } = req.body;

    if (!productId || !quantity || !carrierName || !origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, carrier name, origin, and destination are required',
      });
    }

    const product = await Product.findById(productId).populate('farmer');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Specified product batch does not exist',
      });
    }

    if (Number(quantity) > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Shipment quantity (${quantity} ${product.unit}) exceeds available batch inventory (${product.quantity} ${product.unit})`,
      });
    }

    const trackingNumber = generateTrackingNumber();

    const initialCheckpoint = {
      status: 'Pending',
      location: origin,
      timestamp: new Date(),
      notes: notes || 'Shipment registered and queued for logistics dispatch.',
      updatedBy: req.user.name || 'Logistics Coordinator',
    };

    const shipment = await Shipment.create({
      trackingNumber,
      product: product._id,
      batchId: product.batchId,
      farmer: product.farmer ? (product.farmer._id || product.farmer) : null,
      quantity: Number(quantity),
      unit: product.unit,
      carrierName,
      vehicleNumber: vehicleNumber || 'Pending Assignment',
      driverName: driverName || 'Assigned Carrier Driver',
      driverPhone: driverPhone || '',
      origin,
      destination,
      status: 'Pending',
      dispatchDate: new Date(),
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      currentLocation: origin,
      temperatureCondition: temperatureCondition || 'Ambient (20°C - 24°C)',
      checkpoints: [initialCheckpoint],
      notes: notes || '',
    });

    const populated = await Shipment.findById(shipment._id)
      .populate('product')
      .populate('farmer');

    res.status(201).json({
      success: true,
      message: `Shipment ${trackingNumber} created successfully`,
      shipment: populated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/shipments/:id/status
// @desc    Update shipment status through Pending -> In Transit -> Delivered
// @access  Private (Admin or Carrier/Farmer)
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, location, notes } = req.body;

    const validStatuses = ['Pending', 'In Transit', 'Delivered', 'Delayed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    shipment.status = status;
    if (location) shipment.currentLocation = location;
    if (status === 'Delivered') {
      shipment.actualArrival = new Date();
      shipment.currentLocation = shipment.destination;
    }

    // Add milestone checkpoint to the audit trail
    shipment.checkpoints.push({
      status,
      location: location || (status === 'Delivered' ? shipment.destination : shipment.currentLocation),
      timestamp: new Date(),
      notes: notes || `Shipment transitioned to status: ${status}`,
      updatedBy: req.user.name || 'System Operator',
    });

    await shipment.save();

    // Also optionally update the product status
    if (status === 'Delivered') {
      await Product.findByIdAndUpdate(shipment.product, { status: 'Delivered' });
    } else if (status === 'In Transit') {
      await Product.findByIdAndUpdate(shipment.product, { status: 'In Transit' });
    }

    const updated = await Shipment.findById(shipment._id)
      .populate('product')
      .populate('farmer');

    res.json({
      success: true,
      message: `Shipment status updated to ${status}`,
      shipment: updated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/shipments/:id
// @desc    Update general shipment details
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    const {
      carrierName,
      vehicleNumber,
      driverName,
      driverPhone,
      destination,
      estimatedArrival,
      temperatureCondition,
      notes,
    } = req.body;

    if (carrierName) shipment.carrierName = carrierName;
    if (vehicleNumber !== undefined) shipment.vehicleNumber = vehicleNumber;
    if (driverName !== undefined) shipment.driverName = driverName;
    if (driverPhone !== undefined) shipment.driverPhone = driverPhone;
    if (destination) shipment.destination = destination;
    if (estimatedArrival) shipment.estimatedArrival = new Date(estimatedArrival);
    if (temperatureCondition) shipment.temperatureCondition = temperatureCondition;
    if (notes !== undefined) shipment.notes = notes;

    await shipment.save();

    const updated = await Shipment.findById(shipment._id)
      .populate('product')
      .populate('farmer');

    res.json({
      success: true,
      message: 'Shipment details updated successfully',
      shipment: updated,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/shipments/:id
// @desc    Delete shipment
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can remove shipment records',
      });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    await Shipment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Shipment record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
