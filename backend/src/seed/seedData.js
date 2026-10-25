const mongoose = require('mongoose');
const QRCode = require('qrcode');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Shipment = require('../models/Shipment');

const generateQR = async (batchId) => {
  try {
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
    return '';
  }
};

const seedDatabase = async ({ silent = false } = {}) => {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  log('🌱 [Seed] Preparing database with realistic agricultural sample data...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Farmer.deleteMany({}),
    Product.deleteMany({}),
    Shipment.deleteMany({}),
  ]);

  // 1. Create Users
  const adminUser = await User.create({
    name: 'Admin Supervisor (AgriTrace HQ)',
    email: 'admin@agritrace.org',
    password: 'AdminPassword123!',
    role: 'admin',
    phone: '+91 98200 11223',
  });

  const farmerUser1 = await User.create({
    name: 'Ramesh Patil',
    email: 'ramesh.patil@kisan.in',
    password: 'FarmerPassword123!',
    role: 'farmer',
    phone: '+91 98451 22334',
  });

  const farmerUser2 = await User.create({
    name: 'Baljit Singh',
    email: 'baljit.singh@kisan.in',
    password: 'FarmerPassword123!',
    role: 'farmer',
    phone: '+91 97110 33445',
  });

  const farmerUser3 = await User.create({
    name: 'Ananya Reddy',
    email: 'ananya.reddy@kisan.in',
    password: 'FarmerPassword123!',
    role: 'farmer',
    phone: '+91 99002 44556',
  });

  // 2. Create Farmer Profiles
  const farmers = await Farmer.create([
    {
      user: farmerUser1._id,
      name: 'Ramesh Patil',
      contactPhone: '+91 98451 22334',
      contactEmail: 'ramesh.patil@kisan.in',
      location: {
        address: 'Plot 42, Devgad Mango Belt',
        district: 'Ratnagiri',
        state: 'Maharashtra',
      },
      farmSizeAcres: 18.5,
      cropsGrown: ['Alphonso Mangoes', 'Cashews', 'Coconut'],
      certificationStatus: 'Certified Organic',
      licenseNumber: 'AGR-FARM-902144',
      notes: 'Third-generation organic orchard. Uses drip irrigation and bio-fertilizers only.',
    },
    {
      user: farmerUser2._id,
      name: 'Baljit Singh',
      contactPhone: '+91 97110 33445',
      contactEmail: 'baljit.singh@kisan.in',
      location: {
        address: 'Village Khanna, GT Road Corridor',
        district: 'Ludhiana',
        state: 'Punjab',
      },
      farmSizeAcres: 32.0,
      cropsGrown: ['Sharbati Wheat', 'Basmati Rice', 'Mustard'],
      certificationStatus: 'Conventional Verified',
      licenseNumber: 'AGR-FARM-512093',
      notes: 'Equipped with solar-powered sensor arrays for precision soil moisture tracking.',
    },
    {
      user: farmerUser3._id,
      name: 'Ananya Reddy',
      contactPhone: '+91 99002 44556',
      contactEmail: 'ananya.reddy@kisan.in',
      location: {
        address: 'Western Ghats Hill Slopes, Madikeri',
        district: 'Coorg',
        state: 'Karnataka',
      },
      farmSizeAcres: 24.0,
      cropsGrown: ['Arabica Coffee', 'Black Pepper', 'Cardamom'],
      certificationStatus: 'Certified Organic',
      licenseNumber: 'AGR-FARM-784319',
      notes: 'Rainforest Alliance partner. High-altitude canopy plantation.',
    },
    {
      name: 'Rajeshwar Sharma',
      contactPhone: '+91 94250 88990',
      contactEmail: 'rajeshwar.sharma@agromail.in',
      location: {
        address: 'Malwa Agro Hub, Sanwer Road',
        district: 'Indore',
        state: 'Madhya Pradesh',
      },
      farmSizeAcres: 15.0,
      cropsGrown: ['Soybean', 'Chickpeas (Chana)', 'Garlic'],
      certificationStatus: 'In Transition',
      licenseNumber: 'AGR-FARM-331084',
      notes: 'Transitioning to regenerative zero-chemical farming practices.',
    },
    {
      name: 'Meenakshi Sundaram',
      contactPhone: '+91 94432 77112',
      contactEmail: 'meenakshi.s@deltakisan.org',
      location: {
        address: 'Cauvery Delta Canal Bank',
        district: 'Thanjavur',
        state: 'Tamil Nadu',
      },
      farmSizeAcres: 12.5,
      cropsGrown: ['Ponni Rice', 'Banana', 'Urad Dal'],
      certificationStatus: 'Conventional Verified',
      licenseNumber: 'AGR-FARM-640192',
      notes: 'Paddy granary of south; specializes in GI-tagged heritage rice strains.',
    },
  ]);

  // Link farmer profile to user accounts
  farmerUser1.farmerProfile = farmers[0]._id;
  await farmerUser1.save();
  farmerUser2.farmerProfile = farmers[1]._id;
  await farmerUser2.save();
  farmerUser3.farmerProfile = farmers[2]._id;
  await farmerUser3.save();

  // 3. Create Products with QR codes
  const qrCodes = await Promise.all([
    generateQR('AGT-MNG-2025-1001'),
    generateQR('AGT-WHT-2025-1002'),
    generateQR('AGT-COF-2025-1003'),
    generateQR('AGT-SOY-2025-1004'),
    generateQR('AGT-RIC-2025-1005'),
    generateQR('AGT-PEP-2025-1006'),
  ]);

  const products = await Product.create([
    {
      name: 'Ratnagiri Alphonso Mangoes (GI Certified)',
      category: 'Fruits & Vegetables',
      farmer: farmers[0]._id,
      quantity: 2500,
      unit: 'kg',
      pricePerUnit: 220,
      harvestDate: new Date('2025-04-15'),
      expiryDate: new Date('2025-05-15'),
      batchId: 'AGT-MNG-2025-1001',
      storageConditions: 'Refrigerated Cold Chain (12°C - 14°C), ethylene absorbed',
      qualityGrade: 'Grade A (Premium)',
      status: 'In Transit',
      qrCodeDataUrl: qrCodes[0],
      notes: 'Hand-picked at 85% maturity for optimal sweetness and Brix value of 19°.',
    },
    {
      name: 'Sharbati Golden Durum Wheat',
      category: 'Grains & Cereals',
      farmer: farmers[1]._id,
      quantity: 15000,
      unit: 'kg',
      pricePerUnit: 34,
      harvestDate: new Date('2025-03-28'),
      expiryDate: new Date('2026-03-28'),
      batchId: 'AGT-WHT-2025-1002',
      storageConditions: 'Dry ventilated airtight silos, moisture < 11%',
      qualityGrade: 'Grade A (Premium)',
      status: 'Delivered',
      qrCodeDataUrl: qrCodes[1],
      notes: 'High protein content (14.2%), low ash, suitable for premium baking & flour.',
    },
    {
      name: 'Shade-Grown Arabica Green Coffee Beans',
      category: 'Cash Crops',
      farmer: farmers[2]._id,
      quantity: 1800,
      unit: 'kg',
      pricePerUnit: 480,
      harvestDate: new Date('2025-01-20'),
      expiryDate: new Date('2026-01-20'),
      batchId: 'AGT-COF-2025-1003',
      storageConditions: 'GrainPro moisture-barrier bags at 18°C',
      qualityGrade: 'Grade A (Premium)',
      status: 'Stored',
      qrCodeDataUrl: qrCodes[2],
      notes: 'Cupping score 87.5; floral aroma with notes of citrus, honey, and roasted almonds.',
    },
    {
      name: 'Non-GMO High-Protein Soybean',
      category: 'Pulses & Legumes',
      farmer: farmers[3]._id,
      quantity: 8200,
      unit: 'kg',
      pricePerUnit: 46,
      harvestDate: new Date('2025-09-10'),
      expiryDate: new Date('2026-09-10'),
      batchId: 'AGT-SOY-2025-1004',
      storageConditions: 'Clean aeration floor warehouse, pest-controlled',
      qualityGrade: 'Grade B (Standard)',
      status: 'In Transit',
      qrCodeDataUrl: qrCodes[3],
      notes: 'Certified non-GMO tested batch with minimum 40% crude protein.',
    },
    {
      name: 'Thanjavur Traditional Ponni Raw Rice',
      category: 'Grains & Cereals',
      farmer: farmers[4]._id,
      quantity: 12000,
      unit: 'kg',
      pricePerUnit: 58,
      harvestDate: new Date('2025-02-12'),
      expiryDate: new Date('2026-02-12'),
      batchId: 'AGT-RIC-2025-1005',
      storageConditions: 'Aged 12 months in aerated wooden bins',
      qualityGrade: 'Grade A (Premium)',
      status: 'Delivered',
      qrCodeDataUrl: qrCodes[4],
      notes: 'Aged rice with non-sticky texture and aromatic culinary quality.',
    },
    {
      name: 'Tellicherry Extra Bold Black Pepper',
      category: 'Spices & Herbs',
      farmer: farmers[2]._id,
      quantity: 950,
      unit: 'kg',
      pricePerUnit: 650,
      harvestDate: new Date('2025-02-28'),
      expiryDate: new Date('2027-02-28'),
      batchId: 'AGT-PEP-2025-1006',
      storageConditions: 'Vacuum-sealed foil pouches in climate-controlled hub',
      qualityGrade: 'Grade A (Premium)',
      status: 'Harvested',
      qrCodeDataUrl: qrCodes[5],
      notes: 'Sun-dried 4.75mm berries with piperine content > 6.1%.',
    },
  ]);

  // 4. Create Shipments with Complete Milestones
  await Shipment.create([
    {
      trackingNumber: 'SHP-892401',
      product: products[0]._id,
      batchId: 'AGT-MNG-2025-1001',
      farmer: farmers[0]._id,
      quantity: 1500,
      unit: 'kg',
      carrierName: 'GreenWay Reefer Logistics',
      vehicleNumber: 'MH-08-AG-4912',
      driverName: 'Sanjay Deshmukh',
      driverPhone: '+91 98901 55667',
      origin: 'Devgad Farm Gate Hub, Ratnagiri, Maharashtra',
      destination: 'Vashi APMC Cold Storage Terminal, Navi Mumbai',
      status: 'In Transit',
      dispatchDate: new Date(Date.now() - 18 * 3600 * 1000),
      estimatedArrival: new Date(Date.now() + 6 * 3600 * 1000),
      currentLocation: 'Panvel Express Highway Junction',
      temperatureCondition: 'Chilled (12.4°C)',
      checkpoints: [
        {
          status: 'Pending',
          location: 'Devgad Farm Gate Hub, Ratnagiri',
          timestamp: new Date(Date.now() - 20 * 3600 * 1000),
          notes: 'Pre-cooling check complete. Loading into refrigerated container.',
          updatedBy: 'Farm Logistics Coordinator',
        },
        {
          status: 'In Transit',
          location: 'Ratnagiri Highway Toll Plaza',
          timestamp: new Date(Date.now() - 14 * 3600 * 1000),
          notes: 'Dispatched on time. Reefer temperature stable at 12.2°C.',
          updatedBy: 'Sanjay Deshmukh (Driver)',
        },
        {
          status: 'In Transit',
          location: 'Panvel Express Highway Junction',
          timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          notes: 'Passing through expressway corridor. Expected arrival at Vashi within 2.5 hours.',
          updatedBy: 'Automated GPS Gateway',
        },
      ],
      notes: 'High-value organic mango cargo. Continuous temperature log active.',
    },
    {
      trackingNumber: 'SHP-892402',
      product: products[1]._id,
      batchId: 'AGT-WHT-2025-1002',
      farmer: farmers[1]._id,
      quantity: 12000,
      unit: 'kg',
      carrierName: 'Northern Agro Freight Liners',
      vehicleNumber: 'PB-10-CT-8821',
      driverName: 'Gurpreet Singh',
      driverPhone: '+91 98140 22119',
      origin: 'Khanna Grain Market, Ludhiana, Punjab',
      destination: 'Central Food Corporation Grain Silo, Delhi NCR',
      status: 'Delivered',
      dispatchDate: new Date(Date.now() - 48 * 3600 * 1000),
      estimatedArrival: new Date(Date.now() - 24 * 3600 * 1000),
      actualArrival: new Date(Date.now() - 22 * 3600 * 1000),
      currentLocation: 'Central Food Corporation Grain Silo, Delhi NCR',
      temperatureCondition: 'Ambient (23°C)',
      checkpoints: [
        {
          status: 'Pending',
          location: 'Khanna Grain Terminal',
          timestamp: new Date(Date.now() - 50 * 3600 * 1000),
          notes: 'Grain moisture test verified (10.4%). Cargo covered with waterproof tarpaulins.',
          updatedBy: 'Mandi Quality Inspector',
        },
        {
          status: 'In Transit',
          location: 'Ambala Bypass Corridor',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000),
          notes: 'Dispatched through Grand Trunk road corridor without bottlenecks.',
          updatedBy: 'Northern Freight Dispatcher',
        },
        {
          status: 'Delivered',
          location: 'Central Food Corporation Grain Silo, Delhi NCR',
          timestamp: new Date(Date.now() - 22 * 3600 * 1000),
          notes: 'Consignment unloaded into Silo Bay #4. Weight slip and quality verified.',
          updatedBy: 'Receiving Depot Officer',
        },
      ],
      notes: 'Delivered seamlessly with zero transit shrinkage.',
    },
    {
      trackingNumber: 'SHP-892403',
      product: products[2]._id,
      batchId: 'AGT-COF-2025-1003',
      farmer: farmers[2]._id,
      quantity: 1200,
      unit: 'kg',
      carrierName: 'Krishi Southern Express Cargo',
      vehicleNumber: 'KA-12-MB-3019',
      driverName: 'K. R. Venkatesh',
      driverPhone: '+91 94801 88320',
      origin: 'Madikeri Highland Estate, Coorg, Karnataka',
      destination: 'Bengaluru Specialty Roastery & Export Hub, Peenya',
      status: 'Pending',
      dispatchDate: new Date(),
      estimatedArrival: new Date(Date.now() + 18 * 3600 * 1000),
      currentLocation: 'Madikeri Highland Estate',
      temperatureCondition: 'Dry Controlled (19°C)',
      checkpoints: [
        {
          status: 'Pending',
          location: 'Madikeri Highland Estate',
          timestamp: new Date(),
          notes: 'Bags palletized and inspected. Vehicle scheduled to depart at 20:00 hrs.',
          updatedBy: 'Estate Operations Manager',
        },
      ],
      notes: 'Specialty coffee beans intended for export batch roasting.',
    },
    {
      trackingNumber: 'SHP-892404',
      product: products[4]._id,
      batchId: 'AGT-RIC-2025-1005',
      farmer: farmers[4]._id,
      quantity: 10000,
      unit: 'kg',
      carrierName: 'Delta Regional Transport Corp',
      vehicleNumber: 'TN-49-R-5511',
      driverName: 'S. Muthuvel',
      driverPhone: '+91 94441 33201',
      origin: 'Thanjavur Delta Paddy Depot, Tamil Nadu',
      destination: 'Chennai Harbour Export Logistics Terminal',
      status: 'Delivered',
      dispatchDate: new Date(Date.now() - 72 * 3600 * 1000),
      estimatedArrival: new Date(Date.now() - 40 * 3600 * 1000),
      actualArrival: new Date(Date.now() - 38 * 3600 * 1000),
      currentLocation: 'Chennai Harbour Export Logistics Terminal',
      temperatureCondition: 'Dry Ambient (24°C)',
      checkpoints: [
        {
          status: 'Pending',
          location: 'Thanjavur Delta Paddy Depot',
          timestamp: new Date(Date.now() - 74 * 3600 * 1000),
          notes: 'Sealed bags weighed and loaded.',
          updatedBy: 'Tamil Nadu Agro Logistics',
        },
        {
          status: 'In Transit',
          location: 'Tiruchirappalli Junction',
          timestamp: new Date(Date.now() - 60 * 3600 * 1000),
          notes: 'En route along NH-45.',
          updatedBy: 'Fleet Tracker',
        },
        {
          status: 'Delivered',
          location: 'Chennai Harbour Export Logistics Terminal',
          timestamp: new Date(Date.now() - 38 * 3600 * 1000),
          notes: 'Received into maritime customs warehouse.',
          updatedBy: 'Customs Logistics Agent',
        },
      ],
      notes: 'GI-certified rice shipment ready for retail packaging.',
    },
    {
      trackingNumber: 'SHP-892405',
      product: products[3]._id,
      batchId: 'AGT-SOY-2025-1004',
      farmer: farmers[3]._id,
      quantity: 6000,
      unit: 'kg',
      carrierName: 'Western Transitways Express',
      vehicleNumber: 'MP-09-KA-2041',
      driverName: 'Vikas Solanki',
      driverPhone: '+91 97551 66782',
      origin: 'Indore Malwa Agro Aggregator, Madhya Pradesh',
      destination: 'Sanand Food & Bio-Protein Complex, Gujarat',
      status: 'In Transit',
      dispatchDate: new Date(Date.now() - 10 * 3600 * 1000),
      estimatedArrival: new Date(Date.now() + 12 * 3600 * 1000),
      currentLocation: 'Godhra Highway Bypass',
      temperatureCondition: 'Ambient (25°C)',
      checkpoints: [
        {
          status: 'Pending',
          location: 'Indore Malwa Agro Aggregator',
          timestamp: new Date(Date.now() - 12 * 3600 * 1000),
          notes: 'Quality inspection certificate attached.',
          updatedBy: 'Rajeshwar Sharma',
        },
        {
          status: 'In Transit',
          location: 'Godhra Highway Bypass',
          timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          notes: 'Smooth transit across state border. ETA within schedule.',
          updatedBy: 'Vikas Solanki (Driver)',
        },
      ],
      notes: 'Industrial batch dispatched for edible oil & soymeal manufacturing.',
    },
  ]);

  log('✅ [Seed] Successfully seeded realistic agricultural data:');
  log(`   - 4 Users (1 Admin, 3 Farmers)`);
  log(`   - ${farmers.length} Farmers across multiple agricultural states`);
  log(`   - ${products.length} Products with auto-generated QR codes & batch IDs`);
  log(`   - 5 Shipments tracking Pending, In Transit & Delivered supply chains`);
  log('---------------------------------------------------------');
  log('Demo Credentials for Instant Login:');
  log('Admin:  admin@agritrace.org      / AdminPassword123!');
  log('Farmer: ramesh.patil@kisan.in    / FarmerPassword123!');
  log('---------------------------------------------------------');
};

// Allow running directly via `node src/seed/seedData.js`
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('../config/db');

  connectDB()
    .then(async () => {
      await seedDatabase({ silent: false });
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
