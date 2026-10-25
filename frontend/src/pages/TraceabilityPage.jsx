import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  ShieldCheck,
  Sprout,
  Award,
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
  Phone,
  QrCode,
  Printer,
  Copy,
  ExternalLink,
  Layers,
  Thermometer,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const TraceabilityPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [inputBatch, setInputBatch] = useState(batchId || '');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentBatches, setRecentBatches] = useState([]);

  // Fetch traceability data when batchId changes in URL
  useEffect(() => {
    if (batchId) {
      setInputBatch(batchId);
      fetchTrace(batchId);
    } else {
      // Default load first sample batch if no param in URL
      fetchTrace('AGT-MNG-2025-1001');
    }
  }, [batchId]);

  // Fetch recent batches for suggestions
  useEffect(() => {
    api.trace.getRecentBatches()
      .then((res) => {
        if (res.success && res.batches) setRecentBatches(res.batches);
      })
      .catch(() => {});
  }, []);

  const fetchTrace = async (targetBatchId) => {
    if (!targetBatchId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.trace.getByBatchId(targetBatchId);
      if (res.success) {
        setTraceData(res);
      }
    } catch (err) {
      setError(err.message || `No agricultural record found for batch: ${targetBatchId}`);
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputBatch.trim()) return;
    navigate(`/trace/${inputBatch.trim().toUpperCase()}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Traceability certificate link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#f7faf7', minHeight: 'calc(100vh - 72px)', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Search Bar & Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Public Traceability & Provenance Ledger</span>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
            Batch Provenance & Lifecycle Audit
          </h1>
          <p style={{ color: 'var(--neutral-600)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Verify single-origin authenticity, cultivation metrics, quality lab checks, and cold-chain route
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            style={{
              maxWidth: '560px',
              margin: '1.5rem auto 1rem',
              display: 'flex',
              backgroundColor: '#ffffff',
              padding: '0.35rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--primary-400)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem', color: 'var(--primary-700)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Batch ID (e.g. AGT-MNG-2025-1001)..."
              value={inputBatch}
              onChange={(e) => setInputBatch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
              Inspect Batch
            </button>
          </form>

          {/* Suggested Demo Batches */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--neutral-500)', alignSelf: 'center' }}>Quick demo batches:</span>
            {recentBatches.map((b) => (
              <button
                key={b.batchId}
                onClick={() => navigate(`/trace/${b.batchId}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--primary-200)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--primary-800)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {b.batchId} ({b.name?.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="card"
            style={{
              maxWidth: '650px',
              margin: '0 auto 2rem',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              borderColor: '#fca5a5',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#991b1b', fontWeight: 700 }}>Record Not Found</h3>
            <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={() => navigate('/trace/AGT-MNG-2025-1001')}
                className="btn btn-primary btn-sm"
              >
                Load Sample Batch: AGT-MNG-2025-1001
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            Retrieving provenance timeline from MongoDB...
          </div>
        )}

        {/* Trace Data Report */}
        {!loading && traceData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Authenticity Certificate Banner */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
                color: '#ffffff',
                padding: '1.75rem 2rem',
                border: 'none',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={14} color="#86efac" />
                  <span>Verified Genuine Produce • Tamper-Free Provenance</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {traceData.product.name}
                </h2>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    color: '#86efac',
                    marginTop: '0.25rem',
                    fontWeight: 600,
                  }}
                >
                  Batch ID: {traceData.batchId}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#bbf7d0', marginTop: '0.5rem' }}>
                  Digital Signature: {traceData.verification?.digitalSignature}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: '#ffffff', color: '#166534' }}
                >
                  <Copy size={14} /> Copy Certificate Link
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-secondary btn-sm"
                  style={{ backgroundColor: '#ffffff', color: '#166534' }}
                >
                  <Printer size={14} /> Print Certificate
                </button>
              </div>
            </div>

            {/* Split Grid: Farm Origin Profile + Product Batch Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Farmer Profile Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                    }}
                  >
                    {traceData.farmer.name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                      {traceData.farmer.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>
                      License: {traceData.farmer.licenseNumber}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--neutral-50)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Farm Location:</span>
                    <strong style={{ color: 'var(--neutral-800)' }}>
                      {traceData.farmer.location?.district}, {traceData.farmer.location?.state}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Farm Size:</span>
                    <strong style={{ color: 'var(--neutral-800)' }}>
                      {traceData.farmer.farmSizeAcres} Acres
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Certification:</span>
                    <StatusBadge status={traceData.farmer.certificationStatus} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Contact Phone:</span>
                    <span style={{ color: 'var(--neutral-700)' }}>{traceData.farmer.contactPhone}</span>
                  </div>
                </div>

                {traceData.farmer.notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--neutral-600)', fontStyle: 'italic' }}>
                    "{traceData.farmer.notes}"
                  </p>
                )}
              </div>

              {/* Product Specifications & QR Code Tag */}
              <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                    Harvest Specifications
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Category:</span>
                    <strong>{traceData.product.category}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Harvest Date:</span>
                    <strong>{new Date(traceData.product.harvestDate).toLocaleDateString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Batch Volume:</span>
                    <strong>{traceData.product.quantity.toLocaleString()} {traceData.product.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Quality Grade:</span>
                    <strong style={{ color: 'var(--primary-800)' }}>{traceData.product.qualityGrade}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Storage:</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--neutral-700)', textAlign: 'right' }}>
                      {traceData.product.storageConditions}
                    </span>
                  </div>
                </div>

                {/* QR Code Tag Box */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}
                >
                  <QRCodeSVG
                    value={window.location.href}
                    size={110}
                    level="H"
                    fgColor="#15803d"
                  />
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--neutral-500)', marginTop: '0.35rem' }}>
                    Scan to Verify
                  </div>
                </div>
              </div>
            </div>

            {/* End-to-End Timeline Stepper */}
            <div className="card">
              <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--neutral-200)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                  Supply Chain Audit Trail & Checkpoints
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>
                  Chronological provenance log from cultivation to destination distribution center
                </p>
              </div>

              <div className="trace-timeline">
                {traceData.timeline?.map((step, idx) => (
                  <div key={idx} className="timeline-step">
                    <div className="timeline-step-icon">
                      {step.icon === 'Sprout' && <Sprout size={16} />}
                      {step.icon === 'Award' && <Award size={16} />}
                      {step.icon === 'Truck' && <Truck size={16} />}
                      {step.icon === 'Warehouse' && <Layers size={16} />}
                    </div>

                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--neutral-200)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-800)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            STAGE 0{step.step}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                            {step.title}
                          </h4>
                        </div>

                        <StatusBadge status={step.status} />
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--neutral-600)', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} color="var(--primary-700)" />
                          <span>{step.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} color="var(--neutral-400)" />
                          <span>{new Date(step.date).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ color: 'var(--neutral-400)' }}>Responsible Entity:</span>
                          <strong style={{ color: 'var(--neutral-800)' }}>{step.entity}</strong>
                        </div>
                      </div>

                      {/* Step Details Breakdown */}
                      {step.details && (
                        <div
                          style={{
                            backgroundColor: 'var(--neutral-50)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.825rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          {step.details.trackingNumber && (
                            <div>
                              Tracking Number:{' '}
                              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                                {step.details.trackingNumber}
                              </strong>{' '}
                              ({step.details.vehicleNumber || 'Vehicle Assigned'})
                            </div>
                          )}
                          {step.details.driverName && (
                            <div>Driver: {step.details.driverName} ({step.details.driverPhone || 'Contact Active'})</div>
                          )}
                          {step.details.temperatureCondition && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                              <Thermometer size={14} /> Telemetry: {step.details.temperatureCondition}
                            </div>
                          )}
                          {step.details.storageConditions && (
                            <div>Storage: {step.details.storageConditions}</div>
                          )}
                          {step.details.certification && (
                            <div>Certification: {step.details.certification} (License #{step.details.licenseNumber})</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
