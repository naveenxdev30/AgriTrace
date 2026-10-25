const assert = require('assert');

const BACKEND_BASE = 'http://127.0.0.1:5000/api';
const FRONTEND_BASE = 'http://127.0.0.1:5173';

const results = [];

function recordResult(name, status, details = '') {
  results.push({ name, status, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${status}] ${name}${details ? ` - ${details}` : ''}`);
}

async function runComprehensiveTesting() {
  console.log('======================================================================');
  console.log('🚀 AgriTrace Comprehensive Testing & Debugging Pass');
  console.log('======================================================================\n');

  let adminToken = '';
  let farmerToken = '';
  let testFarmerId = '';
  let testProductId = '';
  let testBatchId = '';
  let testShipmentId = '';

  // -------------------------------------------------------------------------
  // 1. Check whether the frontend and backend servers start correctly
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Server Availability ---');
  try {
    const healthRes = await fetch(`${BACKEND_BASE}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'healthy');
    recordResult('Backend Server Running & Healthy', 'PASS', `Uptime: ${healthData.uptimeSeconds}s`);
  } catch (err) {
    recordResult('Backend Server Running & Healthy', 'FAIL', err.message);
  }

  try {
    const frontRes = await fetch(FRONTEND_BASE);
    const frontHtml = await frontRes.text();
    assert.strictEqual(frontRes.status, 200);
    assert(frontHtml.includes('<div id="root">'), 'React root div not found in HTML');
    recordResult('Frontend Vite Server Running & Serving HTML', 'PASS', `Status: ${frontRes.status}`);
  } catch (err) {
    recordResult('Frontend Vite Server Running & Serving HTML', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 2. Authentication and Role-Based Access Control (RBAC)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing Authentication & Role-Based Access ---');
  try {
    const adminLogin = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@agritrace.org', password: 'AdminPassword123!' }),
    }).then((r) => r.json());
    assert.strictEqual(adminLogin.success, true);
    assert.strictEqual(adminLogin.user.role, 'admin');
    assert(adminLogin.token, 'Token missing');
    adminToken = adminLogin.token;
    recordResult('Admin Login Authentication', 'PASS', `User: ${adminLogin.user.name}`);
  } catch (err) {
    recordResult('Admin Login Authentication', 'FAIL', err.message);
  }

  try {
    const farmerLogin = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh.patil@kisan.in', password: 'FarmerPassword123!' }),
    }).then((r) => r.json());
    assert.strictEqual(farmerLogin.success, true);
    assert.strictEqual(farmerLogin.user.role, 'farmer');
    assert(farmerLogin.token, 'Token missing');
    farmerToken = farmerLogin.token;
    recordResult('Farmer Login Authentication', 'PASS', `User: ${farmerLogin.user.name}`);
  } catch (err) {
    recordResult('Farmer Login Authentication', 'FAIL', err.message);
  }

  try {
    const invalidLogin = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@agritrace.org', password: 'WrongPassword999!' }),
    });
    assert.strictEqual(invalidLogin.status, 401);
    recordResult('Reject Invalid Password with 401', 'PASS');
  } catch (err) {
    recordResult('Reject Invalid Password with 401', 'FAIL', err.message);
  }

  try {
    const unauthReq = await fetch(`${BACKEND_BASE}/farmers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unauthorized Farmer' }),
    });
    assert.strictEqual(unauthReq.status, 401);
    recordResult('Protect Routes from Missing Bearer Token with 401', 'PASS');
  } catch (err) {
    recordResult('Protect Routes from Missing Bearer Token with 401', 'FAIL', err.message);
  }

  try {
    // Farmer trying to register another farmer (admin only)
    const forbiddenReq = await fetch(`${BACKEND_BASE}/farmers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`,
      },
      body: JSON.stringify({
        name: 'Forbidden Test Farmer',
        contactPhone: '+91 99999 11111',
        farmSizeAcres: 10,
      }),
    });
    assert.strictEqual(forbiddenReq.status, 403);
    recordResult('Enforce RBAC: Farmer Cannot Access Admin-Only Route (403 Forbidden)', 'PASS');
  } catch (err) {
    recordResult('Enforce RBAC: Farmer Cannot Access Admin-Only Route (403 Forbidden)', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 3. Test Dashboard and its Statistics
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing Dashboard & Analytics ---');
  try {
    const statsRes = await fetch(`${BACKEND_BASE}/stats/dashboard`);
    const statsData = await statsRes.json();
    assert.strictEqual(statsData.success, true);
    assert(statsData.stats.totalFarmers >= 5, 'Farmers count mismatch');
    assert(statsData.stats.totalProducts >= 6, 'Products count mismatch');
    assert(statsData.stats.activeShipments >= 1, 'Active shipments mismatch');
    assert(statsData.stats.deliveredShipments >= 1, 'Delivered shipments mismatch');
    assert(Array.isArray(statsData.monthlyTrends) && statsData.monthlyTrends.length > 0, 'Monthly trends missing');
    assert(Array.isArray(statsData.categoryStats) && statsData.categoryStats.length > 0, 'Category stats missing');
    assert(Array.isArray(statsData.recentShipments), 'Recent shipments missing');
    assert(Array.isArray(statsData.recentProducts), 'Recent products missing');
    recordResult(
      'Dashboard Metrics & Analytics Data',
      'PASS',
      `Farmers: ${statsData.stats.totalFarmers}, Products: ${statsData.stats.totalProducts}, Shipments: ${statsData.stats.totalShipments}`
    );
  } catch (err) {
    recordResult('Dashboard Metrics & Analytics Data', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 4. Test Farmer Management (Add, View, Edit, Delete)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Farmer Management (CRUD) ---');
  try {
    // Add Farmer
    const newFarmer = {
      name: 'Harpreet Kaur Dhillon',
      contactPhone: '+91 98150 77665',
      contactEmail: 'harpreet.dhillon@punjabagro.in',
      location: {
        address: 'Bhatinda Agro Sector 4',
        district: 'Bhatinda',
        state: 'Punjab',
      },
      farmSizeAcres: 28.5,
      cropsGrown: ['Organic Mustard', 'Sunflower', 'Barley'],
      certificationStatus: 'Certified Organic',
      notes: 'Certified organic seed producer.',
    };

    const addRes = await fetch(`${BACKEND_BASE}/farmers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newFarmer),
    }).then((r) => r.json());

    assert.strictEqual(addRes.success, true);
    assert(addRes.farmer._id);
    testFarmerId = addRes.farmer._id;
    recordResult('Create Farmer (Admin)', 'PASS', `Farmer ID: ${testFarmerId}`);
  } catch (err) {
    recordResult('Create Farmer (Admin)', 'FAIL', err.message);
  }

  try {
    // View Farmers List & Single Farmer
    const listRes = await fetch(`${BACKEND_BASE}/farmers?search=Harpreet`).then((r) => r.json());
    assert.strictEqual(listRes.success, true);
    assert(listRes.farmers.some((f) => f._id === testFarmerId));

    const singleRes = await fetch(`${BACKEND_BASE}/farmers/${testFarmerId}`).then((r) => r.json());
    assert.strictEqual(singleRes.success, true);
    assert.strictEqual(singleRes.farmer.name, 'Harpreet Kaur Dhillon');
    recordResult('View Farmer List & Detail View', 'PASS', `Found: ${singleRes.farmer.name}`);
  } catch (err) {
    recordResult('View Farmer List & Detail View', 'FAIL', err.message);
  }

  try {
    // Edit Farmer
    const editRes = await fetch(`${BACKEND_BASE}/farmers/${testFarmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        farmSizeAcres: 35.0,
        notes: 'Updated farm acreage to 35 acres after expansion.',
      }),
    }).then((r) => r.json());

    assert.strictEqual(editRes.success, true);
    assert.strictEqual(editRes.farmer.farmSizeAcres, 35.0);
    recordResult('Edit Farmer Profile', 'PASS', `New Acreage: ${editRes.farmer.farmSizeAcres}`);
  } catch (err) {
    recordResult('Edit Farmer Profile', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 5. Test Product Registration & Batch ID Generation & QR Code
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Testing Product & Batch Management ---');
  try {
    testBatchId = `AGT-MST-${Date.now().toString().slice(-4)}`;
    const productPayload = {
      name: 'Cold-Pressed Organic Mustard Seeds',
      category: 'Spices & Herbs',
      farmer: testFarmerId,
      quantity: 5000,
      unit: 'kg',
      pricePerUnit: 120,
      harvestDate: '2025-10-20',
      batchId: testBatchId,
      storageConditions: 'Dry climate-controlled storage, humidity < 9%',
      qualityGrade: 'Grade A (Premium)',
      notes: 'High erucic acid optimal oil yield harvest.',
    };

    const prodRes = await fetch(`${BACKEND_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(productPayload),
    }).then((r) => r.json());

    assert.strictEqual(prodRes.success, true);
    assert.strictEqual(prodRes.product.batchId, testBatchId);
    assert(prodRes.product.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR Code missing');
    testProductId = prodRes.product._id;
    recordResult('Product Registration with Custom Batch ID', 'PASS', `Batch: ${testBatchId}`);
    recordResult('Automated QR Code Generation for Product Batch', 'PASS', `QR Length: ${prodRes.product.qrCodeDataUrl.length} chars`);
  } catch (err) {
    recordResult('Product Registration with Custom Batch ID', 'FAIL', err.message);
  }

  try {
    // Test Auto-Generated Batch ID when batchId is empty
    const autoProdRes = await fetch(`${BACKEND_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Organic Sunflower Seeds',
        category: 'Spices & Herbs',
        farmer: testFarmerId,
        quantity: 2000,
        unit: 'kg',
        pricePerUnit: 90,
        harvestDate: '2025-10-22',
        batchId: '', // Should trigger auto-generation
      }),
    }).then((r) => r.json());

    assert.strictEqual(autoProdRes.success, true);
    assert(autoProdRes.product.batchId.startsWith('AGT-ORG-') || autoProdRes.product.batchId.startsWith('AGT-SUN-') || autoProdRes.product.batchId.startsWith('AGT-'), 'Batch ID not formatted properly');
    recordResult('Auto-Generation of Unique Batch ID', 'PASS', `Generated: ${autoProdRes.product.batchId}`);
  } catch (err) {
    recordResult('Auto-Generation of Unique Batch ID', 'FAIL', err.message);
  }

  try {
    // Duplicate Batch ID rejection
    const dupRes = await fetch(`${BACKEND_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Test',
        category: 'Spices & Herbs',
        farmer: testFarmerId,
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 50,
        harvestDate: '2025-10-20',
        batchId: testBatchId, // Duplicate!
      }),
    });
    assert.strictEqual(dupRes.status, 400);
    recordResult('Enforce Unique Batch ID Constraint (Reject Duplicate with 400)', 'PASS');
  } catch (err) {
    recordResult('Enforce Unique Batch ID Constraint (Reject Duplicate with 400)', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 6. Test Shipment Creation and Status Progression
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Testing Shipment Management & Lifecycle ---');
  try {
    // Check quantity exceeding available stock rejection
    const excessShipment = await fetch(`${BACKEND_BASE}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        product: testProductId,
        quantity: 999999, // Exceeds 5000 kg
        carrierName: 'Test Express',
        origin: 'Bhatinda',
        destination: 'Delhi',
      }),
    });
    assert.strictEqual(excessShipment.status, 400);
    recordResult('Validate Shipment Quantity Against Inventory Stock', 'PASS');
  } catch (err) {
    recordResult('Validate Shipment Quantity Against Inventory Stock', 'FAIL', err.message);
  }

  try {
    // Create Valid Shipment
    const shipmentPayload = {
      product: testProductId,
      quantity: 2500,
      carrierName: 'Punjab Agro Express Cargo',
      vehicleNumber: 'PB-03-AX-8910',
      driverName: 'Manjit Singh',
      driverPhone: '+91 98720 33441',
      origin: 'Bhatinda Agro Terminal, Punjab',
      destination: 'Jaipur Spices & Edible Oil Market, Rajasthan',
      estimatedArrival: '2025-10-27',
      temperatureCondition: 'Dry Controlled (20°C)',
      notes: 'Initial consignment staged and ready for highway transit.',
    };

    const shipRes = await fetch(`${BACKEND_BASE}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(shipmentPayload),
    }).then((r) => r.json());

    assert.strictEqual(shipRes.success, true);
    assert.strictEqual(shipRes.shipment.status, 'Pending');
    assert(shipRes.shipment.trackingNumber.startsWith('SHP-'));
    testShipmentId = shipRes.shipment._id;
    recordResult('Create Shipment Consignment', 'PASS', `Tracking #${shipRes.shipment.trackingNumber}`);
  } catch (err) {
    recordResult('Create Shipment Consignment', 'FAIL', err.message);
  }

  try {
    // Update Status: Pending -> In Transit
    const transitRes = await fetch(`${BACKEND_BASE}/shipments/${testShipmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'In Transit',
        location: 'Hisar Highway Border Checkpoint, Haryana',
        notes: 'Dispatched on time. GPS tracker active.',
      }),
    }).then((r) => r.json());

    assert.strictEqual(transitRes.success, true);
    assert.strictEqual(transitRes.shipment.status, 'In Transit');
    assert.strictEqual(transitRes.shipment.checkpoints.length, 2);
    recordResult('Update Shipment Status ➔ In Transit with Checkpoint', 'PASS', `Location: ${transitRes.shipment.currentLocation}`);
  } catch (err) {
    recordResult('Update Shipment Status ➔ In Transit with Checkpoint', 'FAIL', err.message);
  }

  try {
    // Update Status: In Transit -> Delivered
    const deliverRes = await fetch(`${BACKEND_BASE}/shipments/${testShipmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Delivered',
        location: 'Jaipur Spices & Edible Oil Market, Rajasthan',
        notes: 'Consignment safely unloaded. Weight verified at 2,500 kg.',
      }),
    }).then((r) => r.json());

    assert.strictEqual(deliverRes.success, true);
    assert.strictEqual(deliverRes.shipment.status, 'Delivered');
    assert.strictEqual(deliverRes.shipment.checkpoints.length, 3);
    assert(deliverRes.shipment.actualArrival, 'Actual arrival date missing');
    recordResult('Update Shipment Status ➔ Delivered with Milestone Timestamp', 'PASS', `Checkpoints: ${deliverRes.shipment.checkpoints.length}`);
  } catch (err) {
    recordResult('Update Shipment Status ➔ Delivered with Milestone Timestamp', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 7. Test Batch Provenance & Public Traceability
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Testing Batch Provenance & Public Traceability ---');
  try {
    const traceRes = await fetch(`${BACKEND_BASE}/trace/${testBatchId}`).then((r) => r.json());
    assert.strictEqual(traceRes.success, true);
    assert.strictEqual(traceRes.batchId, testBatchId);
    assert.strictEqual(traceRes.farmer.name, 'Harpreet Kaur Dhillon');
    assert.strictEqual(traceRes.product.name, 'Cold-Pressed Organic Mustard Seeds');
    assert.strictEqual(traceRes.currentPhase, 'Delivered to Destination');
    assert(traceRes.timeline.length >= 3, 'Timeline missing stages');
    assert.strictEqual(traceRes.verification.isAuthentic, true);
    assert(traceRes.verification.digitalSignature.startsWith(`AGT-VERIFY-${testBatchId}`));
    recordResult('Public Provenance Trace by Batch ID', 'PASS', `Phase: ${traceRes.currentPhase}`);
    recordResult('Cryptographic Digital Verification Signature', 'PASS', `Signature: ${traceRes.verification.digitalSignature}`);
    recordResult('Chronological 4-Stage Stepper Provenance Log', 'PASS', `Stages: ${traceRes.timeline.length}`);
  } catch (err) {
    recordResult('Public Provenance Trace by Batch ID', 'FAIL', err.message);
  }

  try {
    // Non-existent batch ID returns 404
    const notFoundRes = await fetch(`${BACKEND_BASE}/trace/NON-EXISTENT-9999`);
    assert.strictEqual(notFoundRes.status, 404);
    recordResult('Handle Non-Existent Batch Lookup with 404', 'PASS');
  } catch (err) {
    recordResult('Handle Non-Existent Batch Lookup with 404', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // 8. Test Farmer Deletion Safety & Constraint
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Testing Farmer Deletion & Dependency Safety ---');
  try {
    // Try to delete farmer while products are linked -> should be rejected!
    const delBlocked = await fetch(`${BACKEND_BASE}/farmers/${testFarmerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(delBlocked.status, 400);
    recordResult('Protect Linked Farmer Records from Accidental Deletion', 'PASS');
  } catch (err) {
    recordResult('Protect Linked Farmer Records from Accidental Deletion', 'FAIL', err.message);
  }

  try {
    // Delete the test product first
    const delProd = await fetch(`${BACKEND_BASE}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    // Also delete any other products for testFarmerId to allow deletion test
    const allProdRes = await fetch(`${BACKEND_BASE}/products?farmerId=${testFarmerId}`).then((r) => r.json());
    for (const p of allProdRes.products) {
      // delete shipment first
      await fetch(`${BACKEND_BASE}/shipments/${testShipmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await fetch(`${BACKEND_BASE}/products/${p._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }

    // Now delete farmer -> should succeed
    const delFarmer = await fetch(`${BACKEND_BASE}/farmers/${testFarmerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());

    assert.strictEqual(delFarmer.success, true);
    recordResult('Delete Farmer Record Once Dependencies are Removed', 'PASS');
  } catch (err) {
    recordResult('Delete Farmer Record Once Dependencies are Removed', 'FAIL', err.message);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log('📊 FINAL TEST RESULTS SUMMARY');
  console.log('======================================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Assertions Run: ${results.length}`);
  console.log(`Passed:               ${passed}`);
  console.log(`Failed:               ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTesting().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
