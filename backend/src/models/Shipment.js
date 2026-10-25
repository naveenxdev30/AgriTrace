const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Customs Check', 'Warehouse Hub'],
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: String,
      default: 'System',
    },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Associated product is required'],
    },
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      uppercase: true,
      trim: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      default: 'kg',
    },
    carrierName: {
      type: String,
      required: [true, 'Carrier name is required'],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    driverName: {
      type: String,
      trim: true,
      default: 'Assigned Courier Driver',
    },
    driverPhone: {
      type: String,
      trim: true,
      default: '',
    },
    origin: {
      type: String,
      required: [true, 'Origin hub / farm location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination address / distribution center is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Delivered', 'Delayed'],
      default: 'Pending',
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    estimatedArrival: {
      type: Date,
    },
    actualArrival: {
      type: Date,
    },
    currentLocation: {
      type: String,
      default: 'Origin Warehouse',
    },
    temperatureCondition: {
      type: String,
      default: 'Ambient (20°C - 24°C)',
    },
    checkpoints: [checkpointSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
