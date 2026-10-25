import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Award,
  Layers,
  Sprout,
} from 'lucide-react';

export const FarmersPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [certFilter, setCertFilter] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerToDelete, setFarmerToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contactPhone: '',
    contactEmail: '',
    district: '',
    state: '',
    farmSizeAcres: '',
    cropsGrown: '',
    certificationStatus: 'Conventional Verified',
    notes: '',
  });

  const { isAdmin, user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (certFilter !== 'All') params.certification = certFilter;
      
      const res = await api.farmers.getAll(params);
      if (res.success) {
        setFarmers(res.farmers || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [searchTerm, certFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      contactPhone: '',
      contactEmail: '',
      district: '',
      state: '',
      farmSizeAcres: '',
      cropsGrown: '',
      certificationStatus: 'Conventional Verified',
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name || '',
      contactPhone: farmer.contactPhone || '',
      contactEmail: farmer.contactEmail || '',
      district: farmer.location?.district || '',
      state: farmer.location?.state || '',
      farmSizeAcres: farmer.farmSizeAcres || '',
      cropsGrown: farmer.cropsGrown?.join(', ') || '',
      certificationStatus: farmer.certificationStatus || 'Conventional Verified',
      notes: farmer.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateFarmer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPhone || !formData.farmSizeAcres) {
      showError('Name, phone, and farm size are required.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        location: {
          district: formData.district || 'Central District',
          state: formData.state || 'Agricultural State',
        },
        farmSizeAcres: Number(formData.farmSizeAcres),
        cropsGrown: formData.cropsGrown,
        certificationStatus: formData.certificationStatus,
        notes: formData.notes,
      };

      await api.farmers.create(payload);
      showSuccess(`Farmer ${formData.name} registered successfully!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchFarmers();
    } catch (err) {
      showError(err.message || 'Failed to create farmer');
    }
  };

  const handleUpdateFarmer = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return;

    try {
      const payload = {
        name: formData.name,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        location: {
          district: formData.district,
          state: formData.state,
        },
        farmSizeAcres: Number(formData.farmSizeAcres),
        cropsGrown: formData.cropsGrown,
        certificationStatus: formData.certificationStatus,
        notes: formData.notes,
      };

      await api.farmers.update(selectedFarmer._id, payload);
      showSuccess(`Farmer profile updated!`);
      setIsEditModalOpen(false);
      setSelectedFarmer(null);
      fetchFarmers();
    } catch (err) {
      showError(err.message || 'Failed to update farmer');
    }
  };

  const handleDeleteFarmer = async () => {
    if (!farmerToDelete) return;
    try {
      await api.farmers.delete(farmerToDelete._id);
      showSuccess(`Farmer ${farmerToDelete.name} removed successfully.`);
      setFarmerToDelete(null);
      fetchFarmers();
    } catch (err) {
      showError(err.message || 'Failed to delete farmer');
      setFarmerToDelete(null);
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
              Farmer Management Directory
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Track farm profiles, acreage, crop specializations, and organic certifications
            </p>
          </div>

          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={16} /> Register New Farmer
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.3rem', fontSize: '0.875rem' }}
                placeholder="Search farmer name, district, license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                color="var(--neutral-400)"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600 }}>
              Certification:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
              value={certFilter}
              onChange={(e) => setCertFilter(e.target.value)}
            >
              <option value="All">All Certifications</option>
              <option value="Certified Organic">Certified Organic</option>
              <option value="In Transition">In Transition</option>
              <option value="Conventional Verified">Conventional Verified</option>
              <option value="Pending Audit">Pending Audit</option>
            </select>
          </div>
        </div>

        {/* Farmers Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Loading farmers...
          </div>
        ) : farmers.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--neutral-500)',
            }}
          >
            <Users size={40} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--neutral-800)' }}>No Farmers Found</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Try adjusting your search criteria or register a new farmer record.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {farmers.map((farmer) => (
              <div
                key={farmer._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderTop: '4px solid var(--primary-600)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                        {farmer.name}
                      </h3>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--primary-700)',
                          marginTop: '0.1rem',
                        }}
                      >
                        {farmer.licenseNumber}
                      </div>
                    </div>
                    <StatusBadge status={farmer.certificationStatus} />
                  </div>

                  {/* Farmland details */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--neutral-600)',
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'var(--neutral-50)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="var(--neutral-400)" />
                      <span>
                        {farmer.location?.district}, {farmer.location?.state}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="var(--neutral-400)" />
                      <span>{farmer.contactPhone}</span>
                    </div>
                    {farmer.contactEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={14} color="var(--neutral-400)" />
                        <span>{farmer.contactEmail}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Sprout size={14} color="var(--primary-600)" />
                      <strong style={{ color: 'var(--neutral-800)' }}>
                        {farmer.farmSizeAcres} Acres Farmland
                      </strong>
                    </div>
                  </div>

                  {/* Crops Grown Pills */}
                  {farmer.cropsGrown && farmer.cropsGrown.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-500)', marginBottom: '0.35rem' }}>
                        Crops Harvested:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {farmer.cropsGrown.map((crop, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-900)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 500,
                            }}
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {farmer.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                      "{farmer.notes}"
                    </p>
                  )}
                </div>

                {/* Footer with actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--neutral-200)',
                    paddingTop: '0.75rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: 'var(--neutral-500)' }}>
                    Active Batches: <strong style={{ color: 'var(--neutral-800)' }}>{farmer.productCount || 0}</strong>
                  </span>

                  {(isAdmin || (user?.farmerProfile?._id === farmer._id)) && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(farmer)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                        title="Edit farmer details"
                      >
                        <Edit2 size={13} /> Edit
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => setFarmerToDelete(farmer)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                          title="Delete farmer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Farmer */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Farmer"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateFarmer}>
                Save Farmer Record
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateFarmer}>
            <div className="form-group">
              <label className="form-label">Farmer Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Patil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="farmer@kisan.in"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ratnagiri"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Farm Size (Acres) *</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="e.g. 18.5"
                  value={formData.farmSizeAcres}
                  onChange={(e) => setFormData({ ...formData, farmSizeAcres: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Certification Status</label>
                <select
                  className="form-select"
                  value={formData.certificationStatus}
                  onChange={(e) => setFormData({ ...formData, certificationStatus: e.target.value })}
                >
                  <option value="Certified Organic">Certified Organic</option>
                  <option value="In Transition">In Transition</option>
                  <option value="Conventional Verified">Conventional Verified</option>
                  <option value="Pending Audit">Pending Audit</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Crops Grown (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alphonso Mangoes, Cashews, Rice"
                value={formData.cropsGrown}
                onChange={(e) => setFormData({ ...formData, cropsGrown: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Field Notes / Agro Details</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Irrigation system, soil type, heritage practices..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Farmer */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Farmer: ${selectedFarmer?.name}`}
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateFarmer}>
                Save Changes
              </button>
            </div>
          }
        >
          <form onSubmit={handleUpdateFarmer}>
            <div className="form-group">
              <label className="form-label">Farmer Full Name</label>
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
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Farm Size (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formData.farmSizeAcres}
                  onChange={(e) => setFormData({ ...formData, farmSizeAcres: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Certification Status</label>
                <select
                  className="form-select"
                  value={formData.certificationStatus}
                  onChange={(e) => setFormData({ ...formData, certificationStatus: e.target.value })}
                  disabled={!isAdmin}
                >
                  <option value="Certified Organic">Certified Organic</option>
                  <option value="In Transition">In Transition</option>
                  <option value="Conventional Verified">Conventional Verified</option>
                  <option value="Pending Audit">Pending Audit</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Crops Grown (comma separated)</label>
              <input
                type="text"
                className="form-input"
                value={formData.cropsGrown}
                onChange={(e) => setFormData({ ...formData, cropsGrown: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Field Notes</label>
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
          isOpen={!!farmerToDelete}
          onClose={() => setFarmerToDelete(null)}
          title="Confirm Farmer Removal"
          maxWidth="450px"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
              <button className="btn btn-secondary" onClick={() => setFarmerToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteFarmer}>
                Delete Farmer
              </button>
            </div>
          }
        >
          <p style={{ fontSize: '0.925rem', color: 'var(--neutral-700)', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{farmerToDelete?.name}</strong> from the system?
            This will only succeed if no active product batches are currently assigned to this farmer.
          </p>
        </Modal>
      </main>
    </div>
  );
};
