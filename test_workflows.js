const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🧪 Starting AgriTrace Full Workflow Integration Tests...\n');

  // 1. Health Check
  console.log('1️⃣ Testing Health Check...');
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  assert.strictEqual(healthRes.status, 'healthy', 'Health check failed');
  console.log('   ✅ Health check passed: status = healthy\n');

  // 2. Admin Login
  console.log('2️⃣ Testing Admin Login...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@agritrace.org',
      password: 'AdminPassword123!',
    }),
  }).then((r) => r.json());

  assert.strictEqual(adminLoginRes.success, true, 'Admin login failed');
  assert.strictEqual(adminLoginRes.user.role, 'admin');
  const adminToken = adminLoginRes.token;
  console.log(`   ✅ Admin authenticated: ${adminLoginRes.user.name} (Role: ${adminLoginRes.user.role})\n`);

  // 3. Farmer Login
  console.log('3️⃣ Testing Farmer Login...');
  const farmerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.patil@kisan.in',
      password: 'FarmerPassword123!',
    }),
  }).then((r) => r.json());

  assert.strictEqual(farmerLoginRes.success, true, 'Farmer login failed');
  assert.strictEqual(farmerLoginRes.user.role, 'farmer');
  console.log(`   ✅ Farmer authenticated: ${farmerLoginRes.user.name} (Role: ${farmerLoginRes.user.role})\n`);

  // 4. Create New Farmer (Admin only)
  console.log('4️⃣ Testing Farmer Registration by Admin...');
  const newFarmerData = {
    name: 'Suresh Chandra Verma',
    contactPhone: '+91 94150 99887',
    contactEmail: 'suresh.verma@agrofarm.in',
    location: {
      address: 'Plot 19, Awadh Agro Cluster',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
    },
    farmSizeAcres: 20.5,
    cropsGrown: ['Basmati Rice', 'Mustard', 'Barley'],
    certificationStatus: 'Certified Organic',
    notes: 'Specializes in chemical-free heritage grain cultivation.',
  };

  const createFarmerRes = await fetch(`${BASE_URL}/farmers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newFarmerData),
  }).then((r) => r.json());

  assert.strictEqual(createFarmerRes.success, true, 'Create farmer failed');
  const createdFarmer = createFarmerRes.farmer;
  console.log(`   ✅ Farmer created: ${createdFarmer.name} (ID: ${createdFarmer._id}, License: ${createdFarmer.licenseNumber})\n`);

  // 5. Create Product Batch with auto QR code
  console.log('5️⃣ Testing Product Batch Creation & QR Generation...');
  const newBatchId = `AGT-TST-${Date.now().toString().slice(-4)}`;
  const productData = {
    name: 'Varanasi Organic Basmati Harvest',
    category: 'Grains & Cereals',
    farmer: createdFarmer._id,
    quantity: 4500,
    unit: 'kg',
    pricePerUnit: 85,
    harvestDate: '2025-10-15',
    batchId: newBatchId,
    storageConditions: 'Temperature-controlled grain silo, moisture < 10%',
    qualityGrade: 'Grade A (Premium)',
    notes: 'Extra long grain traditional aroma.',
  };

  const createProductRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(productData),
  }).then((r) => r.json());

  assert.strictEqual(createProductRes.success, true, 'Product creation failed');
  const createdProduct = createProductRes.product;
  assert(createdProduct.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR code was not generated');
  console.log(`   ✅ Product Batch Created: ${createdProduct.name}`);
  console.log(`      Batch ID: ${createdProduct.batchId}`);
  console.log(`      QR Code: Generated successfully (${createdProduct.qrCodeDataUrl.length} chars)\n`);

  // 6. Create Shipment Consignment
  console.log('6️⃣ Testing Shipment Creation for New Batch...');
  const shipmentData = {
    product: createdProduct._id,
    quantity: 3000,
    carrierName: 'Ganga Agro Freight Fleet',
    vehicleNumber: 'UP-65-BT-4411',
    driverName: 'Santosh Mishra',
    driverPhone: '+91 94520 11223',
    origin: 'Varanasi Grain Depot, Uttar Pradesh',
    destination: 'Kolkata Export Terminal Port, West Bengal',
    estimatedArrival: '2025-10-28',
    temperatureCondition: 'Dry Ventilated (22°C)',
    notes: 'Cargo inspected and sealed with security tag #7712.',
  };

  const createShipmentRes = await fetch(`${BASE_URL}/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(shipmentData),
  }).then((r) => r.json());

  assert.strictEqual(createShipmentRes.success, true, 'Shipment creation failed');
  const createdShipment = createShipmentRes.shipment;
  assert.strictEqual(createdShipment.status, 'Pending');
  console.log(`   ✅ Shipment Created: Tracking #${createdShipment.trackingNumber}`);
  console.log(`      Status: ${createdShipment.status} (Carrier: ${createdShipment.carrierName})\n`);

  // 7. Update Shipment Status: Pending ➔ In Transit ➔ Delivered
  console.log('7️⃣ Testing Shipment Status Progression & Checkpoints...');
  
  // Transition to In Transit
  const inTransitRes = await fetch(`${BASE_URL}/shipments/${createdShipment._id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'In Transit',
      location: 'Sasaram NH-19 Toll Plaza, Bihar',
      notes: 'Dispatched through Grand Trunk road corridor. Vehicle on schedule.',
    }),
  }).then((r) => r.json());

  assert.strictEqual(inTransitRes.success, true, 'Transition to In Transit failed');
  assert.strictEqual(inTransitRes.shipment.status, 'In Transit');
  console.log(`   ✅ Step 1: Shipment status ➔ In Transit (Checkpoint: ${inTransitRes.shipment.currentLocation})`);

  // Transition to Delivered
  const deliveredRes = await fetch(`${BASE_URL}/shipments/${createdShipment._id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Delivered',
      location: 'Kolkata Export Terminal Port, West Bengal',
      notes: 'Consignment successfully unloaded. Quality seal verified intact.',
    }),
  }).then((r) => r.json());

  assert.strictEqual(deliveredRes.success, true, 'Transition to Delivered failed');
  assert.strictEqual(deliveredRes.shipment.status, 'Delivered');
  assert.strictEqual(deliveredRes.shipment.checkpoints.length, 3);
  console.log(`   ✅ Step 2: Shipment status ➔ Delivered (Checkpoints: ${deliveredRes.shipment.checkpoints.length} logged)\n`);

  // 8. Public Traceability Verification by Batch ID
  console.log(`8️⃣ Testing Public Traceability Verification for Batch '${newBatchId}'...`);
  const traceRes = await fetch(`${BASE_URL}/trace/${newBatchId}`).then((r) => r.json());
  
  assert.strictEqual(traceRes.success, true, 'Trace lookup failed');
  assert.strictEqual(traceRes.product.batchId, newBatchId);
  assert.strictEqual(traceRes.farmer.name, createdFarmer.name);
  assert(traceRes.shipments.length >= 1);
  assert.strictEqual(traceRes.verification.isAuthentic, true);
  console.log(`   ✅ Trace Verification Complete:`);
  console.log(`      Product: ${traceRes.product.name}`);
  console.log(`      Farmer Origin: ${traceRes.farmer.name} (${traceRes.farmer.location?.district})`);
  console.log(`      Supply Chain Phase: ${traceRes.currentPhase}`);
  console.log(`      Timeline Milestones: ${traceRes.timeline.length} stages recorded`);
  console.log(`      Digital Signature: ${traceRes.verification.digitalSignature}\n`);

  // 9. Dashboard Statistics Verification
  console.log('9️⃣ Testing Dashboard Aggregation...');
  const statsRes = await fetch(`${BASE_URL}/stats/dashboard`).then((r) => r.json());
  assert.strictEqual(statsRes.success, true);
  console.log(`   ✅ Dashboard Metrics:`);
  console.log(`      Total Farmers: ${statsRes.stats.totalFarmers}`);
  console.log(`      Total Products: ${statsRes.stats.totalProducts}`);
  console.log(`      Active Shipments: ${statsRes.stats.activeShipments}`);
  console.log(`      Delivered Shipments: ${statsRes.stats.deliveredShipments}`);
  console.log(`      Total Inventory Volume: ${statsRes.stats.totalInventoryVolume.toLocaleString()} kg\n`);

  console.log('🎉 ALL INTEGRATION WORKFLOW TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
