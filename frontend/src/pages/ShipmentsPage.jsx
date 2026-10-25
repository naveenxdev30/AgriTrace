import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Thermometer,
  User,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);

  // Status update form
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'In Transit',
    location: '',
    notes: '',
  });

  // Create shipment form
  const [createFormData, setCreateFormData] = useState({
    product: '',
    quantity: '',
    carrierName: 'GreenWay Reefer Logistics',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    origin: '',
    destination: '',
    estimatedArrival: '',
    temperatureCondition: 'Ambient (20°C - 24°C)',
    notes: '',
  });

  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.shipments.getAll(params);
      if (res.success) {
        setShipments(res.shipments || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [searchTerm, statusFilter]);

  // Fetch available products for shipment creation
  useEffect(() => {
    api.products.getAll()
      .then((res) => {
        if (res.success) setProducts(res.products || []);
      })
      .catch(() => {});
  }, []);

  const handleOpenCreate = () => {
    const firstProduct = products[0];
    setCreateFormData({
      product: firstProduct?._id || '',
      quantity: firstProduct ? Math.min(1000, firstProduct.quantity) : 500,
      carrierName: 'GreenWay Agri Logistics',
      vehicleNumber: 'MH-04-AB-7890',
      driverName: 'Rameshwar Yadav',
      driverPhone: '+91 98200 44332',
      origin: firstProduct?.farmer?.location?.district ? `${firstProduct.farmer.location.district} Farm Hub` : 'Central Agricultural Hub',
      destination: 'Central Processing & Distribution Mandi',
      estimatedArrival: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      temperatureCondition: 'Ambient (20°C - 24°C)',
      notes: 'Initial dispatch inspection verified.',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenStatusModal = (shipment) => {
    setSelectedShipment(shipment);
    // suggest next status
    let nextStatus = 'In Transit';
    if (shipment.status === 'Pending') nextStatus = 'In Transit';
    if (shipment.status === 'In Transit') nextStatus = 'Delivered';

    setStatusUpdateData({
      status: nextStatus,
      location: shipment.currentLocation || '',
      notes: '',
    });
    setIsStatusModalOpen(true);
  };

  const handleOpenTimeline = (shipment) => {
    setSelectedShipment(shipment);
    setIsTimelineModalOpen(true);
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!createFormData.product || !createFormData.quantity || !createFormData.carrierName) {
      showError('Please select a product and enter quantity and carrier.');
      return;
    }

    try {
      const payload = {
        product: createFormData.product,
        quantity: Number(createFormData.quantity),
        carrierName: createFormData.carrierName,
        vehicleNumber: createFormData.vehicleNumber,
        driverName: createFormData.driverName,
        driverPhone: createFormData.driverPhone,
        origin: createFormData.origin,
        destination: createFormData.destination,
        estimatedArrival: createFormData.estimatedArrival,
        temperatureCondition: createFormData.temperatureCondition,
        notes: createFormData.notes,
      };

      const res = await api.shipments.create(payload);
      showSuccess(`Consignment ${res.shipment.trackingNumber} scheduled!`);
      setIsCreateModalOpen(false);
      fetchShipments();
    } catch (err) {
      showError(err.message || 'Failed to create shipment');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    try {
      await api.shipments.updateStatus(selectedShipment._id, statusUpdateData);
      showSuccess(`Shipment ${selectedShipment.trackingNumber} moved to ${statusUpdateData.status}!`);
      setIsStatusModalOpen(false);
      setSelectedShipment(null);
      fetchShipments();
    } catch (err) {
      showError(err.message || 'Failed to update shipment status');
    }
  };

  const handleDeleteShipment = async () => {
    if (!shipmentToDelete) return;
    try {
      await api.shipments.delete(shipmentToDelete._id);
      showSuccess('Shipment record removed.');
      setShipmentToDelete(null);
      fetchShipments();
    } catch (err) {
      showError(err.message || 'Failed to remove shipment');
      setShipmentToDelete(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              Shipments & Cold-Chain Fleet
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Create consignments and transition status from Pending ➔ In Transit ➔ Delivered
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={16} /> Create Consignment
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
              placeholder="Search tracking ID, batch, carrier, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={16}
              color="var(--neutral-400)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Status:</span>
            {['All', 'Pending', 'In Transit', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid var(--primary-600)' : '1px solid var(--neutral-300)',
                  backgroundColor: statusFilter === st ? 'var(--primary-600)' : '#ffffff',
                  color: statusFilter === st ? '#ffffff' : 'var(--neutral-600)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Shipments List Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Loading shipments...
          </div>
        ) : shipments.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            <Truck size={40} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--neutral-800)' }}>No Shipments Found</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Create a new shipment to dispatch agricultural batches to retail and distribution centers.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Product & Batch</th>
                    <th>Carrier / Vehicle</th>
                    <th>Route (Origin ➔ Destination)</th>
                    <th>Dispatch / Arrival</th>
                    <th>Status</th>
                    <th>Manage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-800)' }}>
                          {s.trackingNumber}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--neutral-400)' }}>
                          {s.checkpoints?.length || 1} checkpoints
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                          {s.product?.name || 'Crop Consignment'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>
                          {s.batchId} • {s.quantity} {s.unit}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.carrierName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                          {s.vehicleNumber} • {s.driverName}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.825rem', maxWidth: '200px' }}>
                        <div style={{ color: 'var(--neutral-500)' }}>From: {s.origin}</div>
                        <div style={{ color: 'var(--neutral-800)', fontWeight: 600 }}>To: {s.destination}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                        <div>Disp: {s.dispatchDate ? new Date(s.dispatchDate).toLocaleDateString() : 'N/A'}</div>
                        {s.actualArrival ? (
                          <div style={{ color: '#15803d', fontWeight: 600 }}>
                            Delivered: {new Date(s.actualArrival).toLocaleDateString()}
                          </div>
                        ) : s.estimatedArrival ? (
                          <div style={{ color: 'var(--neutral-500)' }}>
                            ETA: {new Date(s.estimatedArrival).toLocaleDateString()}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenStatusModal(s)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                            title="Update shipment stage"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleOpenTimeline(s)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem' }}
                            title="View Checkpoint Timeline"
                          >
                            Timeline
                          </button>

                          <button
                            onClick={() => navigate(`/trace/${s.batchId}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem' }}
                            title="Open Traceability page"
                          >
                            <ExternalLink size={13} />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setShipmentToDelete(s)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem' }}
                              title="Delete shipment record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Shipment */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Agricultural Shipment Consignment"
          maxWidth="600px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateShipment}>
                Create & Queue Shipment
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateShipment}>
            <div className="form-group">
              <label className="form-label">Select Product Batch *</label>
              <select
                className="form-select"
                value={createFormData.product}
                onChange={(e) => {
                  const p = products.find((prod) => prod._id === e.target.value);
                  setCreateFormData({
                    ...createFormData,
                    product: e.target.value,
                    quantity: p ? Math.min(createFormData.quantity || 1000, p.quantity) : createFormData.quantity,
                    origin: p?.farmer?.location?.district ? `${p.farmer.location.district} Farm Gate Hub` : createFormData.origin,
                  });
                }}
                required
              >
                <option value="">Select a batch...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} [{p.batchId}] — Available: {p.quantity} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Shipment Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 1500"
                  value={createFormData.quantity}
                  onChange={(e) => setCreateFormData({ ...createFormData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Carrier Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. GreenWay Reefer Express"
                  value={createFormData.carrierName}
                  onChange={(e) => setCreateFormData({ ...createFormData, carrierName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MH-04-AG-1920"
                  value={createFormData.vehicleNumber}
                  onChange={(e) => setCreateFormData({ ...createFormData, vehicleNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver Name & Phone</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Driver Name"
                    value={createFormData.driverName}
                    onChange={(e) => setCreateFormData({ ...createFormData, driverName: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Phone"
                    value={createFormData.driverPhone}
                    onChange={(e) => setCreateFormData({ ...createFormData, driverPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Origin Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ratnagiri Farm Depot, MH"
                  value={createFormData.origin}
                  onChange={(e) => setCreateFormData({ ...createFormData, origin: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Hub *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Navi Mumbai APMC Terminal"
                  value={createFormData.destination}
                  onChange={(e) => setCreateFormData({ ...createFormData, destination: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Estimated Delivery Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={createFormData.estimatedArrival}
                  onChange={(e) => setCreateFormData({ ...createFormData, estimatedArrival: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cargo Temperature</label>
                <select
                  className="form-select"
                  value={createFormData.temperatureCondition}
                  onChange={(e) => setCreateFormData({ ...createFormData, temperatureCondition: e.target.value })}
                >
                  <option value="Ambient (20°C - 24°C)">Ambient (20°C - 24°C)</option>
                  <option value="Chilled Reefer (10°C - 14°C)">Chilled Reefer (10°C - 14°C)</option>
                  <option value="Cold Storage (2°C - 4°C)">Cold Storage (2°C - 4°C)</option>
                  <option value="Dry Controlled (18°C)">Dry Controlled (18°C)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dispatch Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Transit instructions, seal numbers, humidity precautions..."
                value={createFormData.notes}
                onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal: Update Status */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Shipment Status: ${selectedShipment?.trackingNumber}`}
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateStatus}>
                Save Status Transition
              </button>
            </div>
          }
        >
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label">Transition To New Status *</label>
              <select
                className="form-select"
                value={statusUpdateData.status}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
              >
                <option value="Pending">Pending (Staged at Farm/Warehouse)</option>
                <option value="In Transit">In Transit (Dispatched on Highway/Corridor)</option>
                <option value="Delivered">Delivered (Received at Final Destination)</option>
                <option value="Delayed">Delayed (Customs / Inspection / Congestion)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Checkpoint Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. State Highway Toll Checkpoint / Vashi Terminal"
                value={statusUpdateData.location}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Milestone Audit Log Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Temperature logged at 12.1°C; weight slip signed by receiver."
                value={statusUpdateData.notes}
                onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal: Checkpoints Timeline Viewer */}
        <Modal
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          title={`Shipment Checkpoints: ${selectedShipment?.trackingNumber}`}
          maxWidth="560px"
        >
          {selectedShipment && (
            <div>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong>Batch:</strong> {selectedShipment.batchId}
                </div>
                <div>
                  <strong>Carrier:</strong> {selectedShipment.carrierName}
                </div>
                <div>
                  <StatusBadge status={selectedShipment.status} />
                </div>
              </div>

              <div className="trace-timeline">
                {selectedShipment.checkpoints?.map((cp, idx) => (
                  <div key={idx} className="timeline-step">
                    <div className="timeline-step-icon">
                      <Truck size={14} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{cp.status}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                          {cp.timestamp ? new Date(cp.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                        <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {cp.location}
                      </div>
                      {cp.notes && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                          {cp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Delete Shipment */}
        <Modal
          isOpen={!!shipmentToDelete}
          onClose={() => setShipmentToDelete(null)}
          title="Confirm Shipment Deletion"
          maxWidth="450px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setShipmentToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteShipment}>
                Delete Shipment
              </button>
            </div>
          }
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
            Are you sure you want to delete shipment <strong>{shipmentToDelete?.trackingNumber}</strong>?
            This will permanently remove this transit consignment log.
          </p>
        </Modal>
      </main>
    </div>
  );
};
