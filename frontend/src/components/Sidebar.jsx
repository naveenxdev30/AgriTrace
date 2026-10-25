import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, Users, QrCode, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, isAdmin, isFarmer } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/products', label: 'Products & Batches', icon: Package },
    { to: '/shipments', label: 'Shipments & Fleet', icon: Truck },
    { to: '/farmers', label: 'Farmers Directory', icon: Users },
    { to: '/trace', label: 'Traceability & QR', icon: QrCode },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--neutral-200)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--neutral-400)',
            padding: '0.25rem 0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          Management Portal
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary-800)' : 'var(--neutral-600)',
                backgroundColor: isActive ? 'var(--primary-100)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    color={isActive ? 'var(--primary-700)' : 'var(--neutral-500)'}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Panel: System status & active role */}
      <div
        style={{
          backgroundColor: 'var(--neutral-50)',
          border: '1px solid var(--neutral-200)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
          <CheckCircle2 size={14} />
          <span>MongoDB Live Connected</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
          Session: <strong style={{ color: 'var(--neutral-700)' }}>{user ? (isAdmin ? 'Admin View' : 'Farmer View') : 'Public Guest'}</strong>
        </div>
      </div>
    </aside>
  );
};
