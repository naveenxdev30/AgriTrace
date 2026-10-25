import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { FarmersPage } from './pages/FarmersPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { useAuth } from './context/AuthContext';

// Protected Route wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#b91c1c' }}>
        <h3>Access Restricted</h3>
        <p>This section requires Administrator privileges.</p>
      </div>
    );
  }

  return children;
};

export function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Core application routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/farmers" element={<FarmersPage />} />
        <Route path="/trace" element={<TraceabilityPage />} />
        <Route path="/trace/:batchId" element={<TraceabilityPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
