import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, User, Phone, MapPin, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    phone: '',
    district: '',
    state: '',
    farmSizeAcres: '',
    cropsGrown: '',
    certificationStatus: 'Conventional Verified',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please provide all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      showSuccess('Registration complete! Welcome to AgriTrace.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        backgroundColor: '#f4fbf4',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
            Join AgriTrace Network
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>
            Register your farm or administrator account
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: formData.role === 'farmer' ? '2px solid var(--primary-600)' : '1px solid var(--neutral-300)',
                  backgroundColor: formData.role === 'farmer' ? 'var(--primary-50)' : '#ffffff',
                  fontWeight: 600,
                  color: formData.role === 'farmer' ? 'var(--primary-800)' : 'var(--neutral-700)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🌾 Farmer Producer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: formData.role === 'admin' ? '2px solid var(--primary-600)' : '1px solid var(--neutral-300)',
                  backgroundColor: formData.role === 'admin' ? 'var(--primary-50)' : '#ffffff',
                  fontWeight: 600,
                  color: formData.role === 'admin' ? 'var(--primary-800)' : 'var(--neutral-700)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                🛡️ System Admin
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Ramesh Patil"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="patil@kisan.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password * (min 6 chars)</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Conditional Farmer Fields */}
          {formData.role === 'farmer' && (
            <div
              style={{
                backgroundColor: 'var(--neutral-50)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid var(--neutral-200)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.75rem' }}>
                Farmer Profile & Farmland Details:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    name="district"
                    className="form-input"
                    placeholder="e.g. Ratnagiri, Nashik"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    placeholder="e.g. Maharashtra, Punjab"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="farmSizeAcres"
                    className="form-input"
                    placeholder="e.g. 15"
                    value={formData.farmSizeAcres}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Certification Status</label>
                  <select
                    name="certificationStatus"
                    className="form-select"
                    value={formData.certificationStatus}
                    onChange={handleChange}
                  >
                    <option value="Certified Organic">Certified Organic</option>
                    <option value="In Transition">In Transition</option>
                    <option value="Conventional Verified">Conventional Verified</option>
                    <option value="Pending Audit">Pending Audit</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Main Crops Grown (comma separated)</label>
                <input
                  type="text"
                  name="cropsGrown"
                  className="form-input"
                  placeholder="e.g. Alphonso Mangoes, Wheat, Soybeans"
                  value={formData.cropsGrown}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
