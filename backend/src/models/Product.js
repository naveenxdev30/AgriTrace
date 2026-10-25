const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Grains & Cereals',
        'Fruits & Vegetables',
        'Spices & Herbs',
        'Cash Crops',
        'Pulses & Legumes',
        'Dairy & Organic',
      ],
      default: 'Grains & Cereals',
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Associated farmer is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton', 'crate', 'box', 'litres', 'bags'],
      default: 'kg',
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required'],
    },
    expiryDate: {
      type: Date,
    },
    batchId: {
      type: String,
      required: [true, 'Batch ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    storageConditions: {
      type: String,
      default: 'Ambient temperature, dry ventilated warehouse',
    },
    qualityGrade: {
      type: String,
      enum: ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Industrial)'],
      default: 'Grade A (Premium)',
    },
    status: {
      type: String,
      enum: ['Harvested', 'Stored', 'In Transit', 'Sold', 'Delivered'],
      default: 'Harvested',
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
