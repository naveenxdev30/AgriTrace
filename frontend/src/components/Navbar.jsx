import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Search, ShieldCheck, User, LogOut, LogIn, Menu, X, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isFarmer, logout } = useAuth();
  const { showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [navSearch, setNavSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickTrace = (e) => {
    e.preventDefault();
    if (!navSearch.trim()) return;
    navigate(`/trace/${navSearch.trim().toUpperCase()}`);
    setNavSearch('');
  };

  const handleLogout = () => {
    logout();
    showInfo('Logged out successfully.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav">
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(22, 101, 52, 0.25)',
            }}
          >
            <Sprout size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--neutral-900)',
                  letterSpacing: '-0.02em',
                }}
              >
                Agri<span style={{ color: 'var(--primary-600)' }}>Trace</span>
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--neutral-500)', fontWeight: 500 }}>
              Supply Chain Management & Traceability
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-links"
        >
          <Link
            to="/"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/dashboard') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/dashboard') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/products"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/products') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/products') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Products
          </Link>
          <Link
            to="/shipments"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/shipments') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/shipments') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Shipments
          </Link>
          <Link
            to="/farmers"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/farmers') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/farmers') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Farmers
          </Link>
          <Link
            to="/trace"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/trace') ? 'var(--primary-700)' : 'var(--neutral-600)',
              backgroundColor: isActive('/trace') ? 'var(--primary-50)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <QrCode size={15} color="var(--primary-600)" />
            Traceability
          </Link>
        </div>

        {/* Quick Batch Trace Form */}
        <form
          onSubmit={handleQuickTrace}
          style={{
            display: 'none',
            alignItems: 'center',
            position: 'relative',
          }}
          className="desktop-search"
        >
          <input
            type="text"
            placeholder="Trace batch (e.g. AGT-MNG-2025-1001)..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            style={{
              padding: '0.45rem 2rem 0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--neutral-300)',
              fontSize: '0.825rem',
              width: '260px',
              backgroundColor: 'var(--neutral-50)',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Search Batch Traceability"
          >
            <Search size={16} />
          </button>
        </form>

        {/* User Actions & Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--neutral-100)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--neutral-200)',
                }}
              >
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#dcfce7' : '#fef3c7',
                    color: isAdmin ? '#15803d' : '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                    {user.name?.split(' ')[0]}
                  </div>
                  <div
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: isAdmin ? '#15803d' : '#b45309',
                    }}
                  >
                    {isAdmin ? 'Administrator' : 'Farmer'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--neutral-700)',
              padding: '0.25rem',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--neutral-200)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Home
          </Link>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Dashboard
          </Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Products
          </Link>
          <Link to="/shipments" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Shipments
          </Link>
          <Link to="/farmers" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Farmers
          </Link>
          <Link to="/trace" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0' }}>
            Traceability & QR
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-links { display: flex !important; }
          .desktop-search { display: flex !important; }
        }
        @media (max-width: 859px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
