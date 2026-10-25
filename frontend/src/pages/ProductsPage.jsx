import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { QRCodeModal } from '../components/QRCodeModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Package,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  Truck,
} from 'lucide-react';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [activeQRProduct, setActiveQRProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains & Cereals',
    farmer: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    batchId: '',
    storageConditions: 'Ambient temperature, dry ventilated warehouse',
    qualityGrade: 'Grade A (Premium)',
    notes: '',
  });

  const { isAdmin, isFarmer, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.products.getAll(params);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, statusFilter]);

  // Fetch farmers list for dropdown selection
  useEffect(() => {
    api.farmers.getAll()
      .then((res) => {
        if (res.success) setFarmers(res.farmers || []);
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    const defaultBatchId = 'AGT-' + Math.random().toString(36).substring(2, 5).toUpperCase() + '-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      category: 'Grains & Cereals',
      farmer: farmers[0]?._id || '',
      quantity: '',
      unit: 'kg',
      pricePerUnit: '',
      harvestDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      batchId: defaultBatchId,
      storageConditions: 'Ambient temperature, dry ventilated warehouse',
      qualityGrade: 'Grade A (Premium)',
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleGenerateBatchId = () => {
    const prefix = (formData.name || 'CRX').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, batchId: `AGT-${prefix}-${year}-${rand}` });
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Grains & Cereals',
      farmer: product.farmer?._id || '',
      quantity: product.quantity || '',
      unit: product.unit || 'kg',
      pricePerUnit: product.pricePerUnit || '',
      harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      batchId: product.batchId || '',
      storageConditions: product.storageConditions || '',
      qualityGrade: product.qualityGrade || 'Grade A (Premium)',
      status: product.status || 'Harvested',
      notes: product.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.pricePerUnit || !formData.harvestDate) {
      showError('Please fill in all mandatory product fields.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        farmer: isAdmin ? formData.farmer : (user?.farmerProfile?._id || formData.farmer),
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        harvestDate: formData.harvestDate,
        expiryDate: formData.expiryDate || undefined,
        batchId: formData.batchId,
        storageConditions: formData.storageConditions,
        qualityGrade: formData.qualityGrade,
        notes: formData.notes,
      };

      const res = await api.products.create(payload);
      showSuccess(`Batch ${formData.batchId} registered and QR code generated!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchProducts();
      if (res.product) {
        setActiveQRProduct(res.product);
      }
    } catch (err) {
      showError(err.message || 'Failed to create product batch');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        farmer: isAdmin ? formData.farmer : undefined,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        harvestDate: formData.harvestDate,
        expiryDate: formData.expiryDate || null,
        storageConditions: formData.storageConditions,
        qualityGrade: formData.qualityGrade,
        status: formData.status,
        notes: formData.notes,
      };

      await api.products.update(selectedProduct._id, payload);
      showSuccess(`Product batch ${selectedProduct.batchId} updated.`);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      showError(err.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.products.delete(productToDelete._id);
      showSuccess(`Product batch removed successfully.`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      showError(err.message || 'Failed to delete product');
      setProductToDelete(null);
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
              Product & Batch Inventory
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Manage harvest batches, track origin farm, and issue verified QR tags
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> New Product Batch
          </button>
        </div>

        {/* Filters and Search Bar */}
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
              placeholder="Search product name, batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={16}
              color="var(--neutral-400)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Category:</span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Grains & Cereals">Grains & Cereals</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Spices & Herbs">Spices & Herbs</option>
                <option value="Cash Crops">Cash Crops</option>
                <option value="Pulses & Legumes">Pulses & Legumes</option>
                <option value="Dairy & Organic">Dairy & Organic</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Harvested">Harvested</option>
                <option value="Stored">Stored</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Batches Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Loading product batches...
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            <Package size={40} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--neutral-800)' }}>No Product Batches Found</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Register your first harvest batch to generate its traceability record and QR code.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Product & Category</th>
                    <th>Farmer Producer</th>
                    <th>Harvest Date</th>
                    <th>Available Quantity</th>
                    <th>Unit Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            color: 'var(--primary-800)',
                            backgroundColor: 'var(--primary-50)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--primary-200)',
                            display: 'inline-block',
                          }}
                        >
                          {p.batchId}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                          {p.category} • {p.qualityGrade}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.farmer?.name || 'Local Farm'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                          {p.farmer?.location?.district}, {p.farmer?.location?.state}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
                        {p.harvestDate ? new Date(p.harvestDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--neutral-800)' }}>
                          {p.quantity?.toLocaleString()} {p.unit}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                        ₹{p.pricePerUnit} / {p.unit}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => setActiveQRProduct(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            title="View QR Code"
                          >
                            <QrCode size={13} color="var(--primary-700)" /> QR
                          </button>

                          <button
                            onClick={() => navigate(`/trace/${p.batchId}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="Traceability View"
                          >
                            <ExternalLink size={13} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="Edit batch"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => setProductToDelete(p)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="Delete batch"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Product Batch */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Product Batch & Generate QR"
          maxWidth="600px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateProduct}>
                Save Batch & Generate QR
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateProduct}>
            <div className="form-group">
              <label className="form-label">Crop / Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Organic Alphonso Mangoes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                  <option value="Cash Crops">Cash Crops</option>
                  <option value="Pulses & Legumes">Pulses & Legumes</option>
                  <option value="Dairy & Organic">Dairy & Organic</option>
                </select>
              </div>

              {isAdmin ? (
                <div className="form-group">
                  <label className="form-label">Associated Farmer *</label>
                  <select
                    className="form-select"
                    value={formData.farmer}
                    onChange={(e) => setFormData({ ...formData, farmer: e.target.value })}
                    required
                  >
                    <option value="">Select Farmer...</option>
                    {farmers.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.location?.district})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Producer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.name || 'Current Farmer Account'}
                    disabled
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                  <select
                    className="form-select"
                    style={{ width: '85px' }}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                    <option value="crate">crate</option>
                    <option value="box">box</option>
                    <option value="bags">bags</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price per {formData.unit} (₹) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 45"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Harvest Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            {/* Batch ID with generator */}
            <div className="form-group">
              <label className="form-label">Batch ID * (Unique Traceability Key)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value.toUpperCase() })}
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateBatchId}
                  className="btn btn-secondary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Sparkles size={14} /> Auto-Generate
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Quality Grade</label>
                <select
                  className="form-select"
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                >
                  <option value="Grade A (Premium)">Grade A (Premium)</option>
                  <option value="Grade B (Standard)">Grade B (Standard)</option>
                  <option value="Grade C (Industrial)">Grade C (Industrial)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Conditions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Refrigerated 4°C, dry silo"
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Field Notes / Batch Highlights</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Organic soil certification notes, Brix rating..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Product Batch */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Product Batch: ${selectedProduct?.batchId}`}
          maxWidth="600px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateProduct}>
                Save Changes
              </button>
            </div>
          }
        >
          <form onSubmit={handleUpdateProduct}>
            <div className="form-group">
              <label className="form-label">Crop Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                  <option value="Cash Crops">Cash Crops</option>
                  <option value="Pulses & Legumes">Pulses & Legumes</option>
                  <option value="Dairy & Organic">Dairy & Organic</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Inventory Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Harvested">Harvested</option>
                  <option value="Stored">Stored</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price per {formData.unit} (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Quality Grade</label>
                <select
                  className="form-select"
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                >
                  <option value="Grade A (Premium)">Grade A (Premium)</option>
                  <option value="Grade B (Standard)">Grade B (Standard)</option>
                  <option value="Grade C (Industrial)">Grade C (Industrial)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Conditions</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.storageConditions}
                  onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          title="Confirm Product Batch Deletion"
          maxWidth="450px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setProductToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteProduct}>
                Delete Batch
              </button>
            </div>
          }
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
            Are you sure you want to delete batch <strong>{productToDelete?.batchId}</strong> ({productToDelete?.name})?
            This will only be permitted if there are no active transit shipments associated with it.
          </p>
        </Modal>

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={!!activeQRProduct}
          onClose={() => setActiveQRProduct(null)}
          product={activeQRProduct}
        />
      </main>
    </div>
  );
};
