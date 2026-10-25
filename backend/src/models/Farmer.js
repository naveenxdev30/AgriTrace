const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    location: {
      address: { type: String, default: '' },
      district: { type: String, required: [true, 'District is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
    },
    farmSizeAcres: {
      type: Number,
      required: [true, 'Farm size (in acres) is required'],
      min: [0.1, 'Farm size must be greater than 0'],
    },
    cropsGrown: {
      type: [String],
      default: [],
    },
    certificationStatus: {
      type: String,
      enum: ['Certified Organic', 'In Transition', 'Conventional Verified', 'Pending Audit'],
      default: 'Conventional Verified',
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: function () {
        return 'AGR-FARM-' + Math.floor(100000 + Math.random() * 900000);
      },
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = mongoose.model('Farmer', farmerSchema);
