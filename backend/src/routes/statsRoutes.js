const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');

// @route   GET /api/stats/dashboard
// @desc    Get dashboard metrics, charts, and summary statistics
// @access  Public / Authenticated
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalFarmers,
      totalProducts,
      activeShipments,
      deliveredShipments,
      totalShipments,
    ] = await Promise.all([
      Farmer.countDocuments(),
      Product.countDocuments(),
      Shipment.countDocuments({ status: { $in: ['In Transit', 'Pending'] } }),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments(),
    ]);

    // Aggregate products by category
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Aggregate shipments by status
    const shipmentStats = await Shipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total crop volume
    const volumeAggregate = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalQty: { $sum: '$quantity' },
        },
      },
    ]);
    const totalInventoryVolume = volumeAggregate[0]?.totalQty || 0;

    // Recent shipments
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name batchId unit')
      .populate('farmer', 'name');

    // Recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'name location');

    // Monthly harvest data for chart
    const monthlyTrends = [
      { month: 'May', volume: 14200, shipments: 12 },
      { month: 'Jun', volume: 18500, shipments: 18 },
      { month: 'Jul', volume: 22400, shipments: 24 },
      { month: 'Aug', volume: 29800, shipments: 31 },
      { month: 'Sep', volume: 34100, shipments: 39 },
      { month: 'Oct', volume: 41200, shipments: 46 },
    ];

    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalProducts,
        activeShipments,
        deliveredShipments,
        totalShipments,
        totalInventoryVolume,
      },
      categoryStats,
      shipmentStats,
      monthlyTrends,
      recentShipments,
      recentProducts,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
