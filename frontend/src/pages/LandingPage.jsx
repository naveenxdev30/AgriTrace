import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Truck,
  QrCode,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  Package,
  Layers,
  Award,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LandingPage = () => {
  const [searchBatch, setSearchBatch] = useState('');
  const [recentBatches, setRecentBatches] = useState([]);
  const [demoCreds, setDemoCreds] = useState([]);
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent batches and demo accounts
    api.trace.getRecentBatches()
      .then((res) => {
        if (res.success && res.batches) {
          setRecentBatches(res.batches);
        }
      })
      .catch((err) => console.warn('Could not fetch preview batches:', err.message));

    api.auth.getDemoCredentials()
      .then((res) => {
        if (res.success && res.accounts) {
          setDemoCreds(res.accounts);
        }
      })
      .catch((err) => console.warn('Could not fetch demo accounts:', err.message));
  }, []);

  const handleTraceSubmit = (e) => {
    e.preventDefault();
    if (!searchBatch.trim()) return;
    navigate(`/trace/${searchBatch.trim().toUpperCase()}`);
  };

  const handleQuickDemoLogin = async (acc) => {
    try {
      await login(acc.email, acc.password);
      showSuccess(`Logged in successfully as ${acc.title}!`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(circle at top left, #f0fdf4 0%, #ffffff 70%)',
          padding: '4.5rem 1.5rem 3.5rem',
          borderBottom: '1px solid var(--neutral-200)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              backgroundColor: 'var(--primary-100)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-800)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1px solid var(--primary-200)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Agricultural Transparency & Traceability System</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--neutral-900)',
              lineHeight: 1.15,
              maxWidth: '900px',
              margin: '0 auto 1.5rem',
            }}
          >
            Track Agricultural Harvest From{' '}
            <span style={{ color: 'var(--primary-700)' }}>Farm to Consumer</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--neutral-600)',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            AgriTrace eliminates counterfeit produce and supply chain blind spots. Verify crop origins,
            farmer certifications, transit checkpoints, and batch authenticity with instant QR code scanning.
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: '620px', margin: '0 auto 2rem' }}>
            <form
              onSubmit={handleTraceSubmit}
              style={{
                display: 'flex',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ffffff',
                padding: '0.35rem',
                border: '2px solid var(--primary-300)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '1rem',
                  color: 'var(--primary-700)',
                }}
              >
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchBatch}
                onChange={(e) => setSearchBatch(e.target.value)}
                placeholder="Enter Batch ID (e.g. AGT-MNG-2025-1001)..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.85rem 1rem',
                  fontSize: '1rem',
                  color: 'var(--neutral-800)',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
                Trace Batch <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Demo Batch Tags */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--neutral-500)',
              }}
            >
              <span>Try Demo Batches:</span>
              {['AGT-MNG-2025-1001', 'AGT-WHT-2025-1002', 'AGT-COF-2025-1003'].map((batch) => (
                <button
                  key={batch}
                  onClick={() => navigate(`/trace/${batch}`)}
                  style={{
                    background: 'var(--primary-50)',
                    border: '1px solid var(--primary-200)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--primary-800)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {batch}
                </button>
              ))}
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              Explore Live Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
              <Package size={16} /> View All Product Batches
            </Link>
          </div>
        </div>
      </section>

      {/* 1-Click Demo Access Banner for College Viva / Testing */}
      <section style={{ backgroundColor: 'var(--neutral-50)', padding: '2rem 1.5rem', borderBottom: '1px solid var(--neutral-200)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: '#ffffff',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary-200)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                <Lock size={16} color="var(--primary-600)" />
                <span>Instant 1-Click Demonstration Login</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '0.25rem' }}>
                Test role-based access control with pre-seeded credentials.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {demoCreds.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    border: '1px solid var(--primary-300)',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-900)',
                  }}
                >
                  Sign in as <strong>{acc.title.split(' ')[0]}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Supply Chain Stepper */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
            The 4-Stage AgriTrace Lifecycle
          </h2>
          <p style={{ color: 'var(--neutral-600)', marginTop: '0.5rem' }}>
            Transparent end-to-end data provenance recorded at every node
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              step: '01',
              title: 'Harvest & Farm Origin',
              desc: 'Farmer logs crop yield, geographic district, farm size, and organic certification credentials.',
              icon: Sprout,
              color: '#15803d',
            },
            {
              step: '02',
              title: 'Quality & Batch ID',
              desc: 'Automated batch number generation with moisture, Brix, protein quality grade checks.',
              icon: Award,
              color: '#0284c7',
            },
            {
              step: '03',
              title: 'Cold Chain & Transit',
              desc: 'Carrier logistics tracking from Pending to In Transit with temperature and GPS milestones.',
              icon: Truck,
              color: '#d97706',
            },
            {
              step: '04',
              title: 'QR Consumer Verification',
              desc: 'Retail buyers and consumers scan the unique QR code on the packaging for instant proof of origin.',
              icon: QrCode,
              color: '#7e22ce',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--neutral-100)',
                    position: 'absolute',
                    top: '0.75rem',
                    right: '1rem',
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--neutral-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Overview */}
      <section style={{ backgroundColor: 'var(--neutral-50)', padding: '4rem 1.5rem', borderTop: '1px solid var(--neutral-200)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              Built for Modern Agricultural Supply Chains
            </h2>
            <p style={{ color: 'var(--neutral-600)', marginTop: '0.5rem' }}>
              Full-stack system with comprehensive features for college project viva & evaluation
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                title: 'Farmer Profile & Field Management',
                desc: 'Add, view, edit, and delete farmer profiles with GPS district, crop specializations, and organic certification status.',
                icon: Users,
              },
              {
                title: 'Batch Inventory & Quality Grading',
                desc: 'Record harvested products, quantities, prices, harvest dates, storage parameters, and auto-generated unique batch IDs.',
                icon: Package,
              },
              {
                title: 'Fleet & Shipment Milestones',
                desc: 'Dispatch shipments and update statuses across Pending, In Transit, and Delivered with location checkpoint audit logs.',
                icon: Truck,
              },
              {
                title: 'Dynamic QR Code Generation',
                desc: 'Generate downloadable, printable QR codes directly linked to the public batch verification and audit trail page.',
                icon: QrCode,
              },
              {
                title: 'Role-Based Authentication',
                desc: 'Secure JWT authentication with distinct access views for Administrators (full control) and Farmers (crop batches).',
                icon: ShieldCheck,
              },
              {
                title: 'Zero-Config MongoDB Persistence',
                desc: 'Engineered with Mongoose schemas and automatic fallback for seamless offline demonstration on any computer.',
                icon: Layers,
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      {feature.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--neutral-200)', padding: '2.5rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sprout size={20} color="var(--primary-700)" />
            <strong style={{ color: 'var(--neutral-900)' }}>AgriTrace</strong>
            <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>
              — Agricultural Supply Chain Management System
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            Academic Project Demonstration • React + Node.js + Express + MongoDB
          </div>
        </div>
      </footer>
    </div>
  );
};
