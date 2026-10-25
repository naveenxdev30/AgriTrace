import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  Truck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  QrCode,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { MonthlyHarvestBarChart, ShipmentStatusDonutChart } from '../components/ChartView';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProductQR, setSelectedProductQR] = useState(null);
  const { user, isAdmin, isFarmer } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.stats.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header with Title and Quick Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
              Supply Chain Dashboard
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
              Welcome back, <strong>{user?.name || 'Guest Operator'}</strong> • {isAdmin ? 'Administrator HQ' : 'Farmer Portal'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchDashboardData}
              className="btn btn-secondary btn-sm"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <Link to="/products" className="btn btn-primary btn-sm">
              <Plus size={15} /> New Product Batch
            </Link>
            <Link to="/shipments" className="btn btn-secondary btn-sm">
              <Truck size={15} /> Shipments
            </Link>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fecaca',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Loading supply chain metrics...
          </div>
        ) : data ? (
          <>
            {/* 4 Primary KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <StatCard
                title="Total Registered Farmers"
                value={data.stats.totalFarmers}
                icon={Users}
                color="green"
                subtitle="Verified farm producers"
                change="+14% this month"
              />
              <StatCard
                title="Total Product Batches"
                value={data.stats.totalProducts}
                icon={Package}
                color="blue"
                subtitle={`${(data.stats.totalInventoryVolume || 0).toLocaleString()} kg total harvest`}
                change="+22% volume"
              />
              <StatCard
                title="Active Transit Shipments"
                value={data.stats.activeShipments}
                icon={Truck}
                color="amber"
                subtitle="In Transit & Pending dispatch"
                change="Live GPS tracking"
              />
              <StatCard
                title="Delivered Consignments"
                value={data.stats.deliveredShipments}
                icon={CheckCircle2}
                color="purple"
                subtitle="Successfully verified delivery"
                change="100% on-time"
              />
            </div>

            {/* Charts Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              {/* Monthly Volume Bar Chart */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      Monthly Harvest Yield Trend
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                      Aggregated farm output in kilograms (kg)
                    </p>
                  </div>
                  <span className="badge badge-delivered">Verified</span>
                </div>
                <MonthlyHarvestBarChart data={data.monthlyTrends} />
              </div>

              {/* Shipment Status Breakdown */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      Logistics Status Distribution
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                      Live breakdown across {data.stats.totalShipments} total shipments
                    </p>
                  </div>
                  <Link to="/shipments" style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    View All &rarr;
                  </Link>
                </div>
                <ShipmentStatusDonutChart stats={data.shipmentStats} />

                {/* Category Inventory Breakdown */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--neutral-200)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: '0.75rem' }}>
                    Top Crop Categories:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.categoryStats?.slice(0, 4).map((cat) => (
                      <div
                        key={cat._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.825rem',
                        }}
                      >
                        <span style={{ color: 'var(--neutral-600)' }}>{cat._id}</span>
                        <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                          {cat.count} batches ({cat.totalQuantity.toLocaleString()} kg)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row: Recent Shipments & Recent Products */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Recent Shipments */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--neutral-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      Recent Consignments
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                      Latest active & delivered shipments
                    </p>
                  </div>
                  <Link to="/shipments" className="btn btn-secondary btn-sm">
                    Manage Shipments
                  </Link>
                </div>

                <div className="table-responsive">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Tracking ID</th>
                        <th>Batch / Product</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentShipments?.map((shipment) => (
                        <tr key={shipment._id}>
                          <td>
                            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-800)' }}>
                              {shipment.trackingNumber}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{shipment.product?.name || 'Crop Consignment'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontFamily: 'var(--font-mono)' }}>
                              {shipment.batchId}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {shipment.destination}
                          </td>
                          <td>
                            <StatusBadge status={shipment.status} />
                          </td>
                          <td>
                            <button
                              onClick={() => navigate(`/trace/${shipment.batchId}`)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              title="Trace this shipment"
                            >
                              Trace
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Products */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--neutral-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      Recent Product Batches
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                      Harvest inventory with verified QR codes
                    </p>
                  </div>
                  <Link to="/products" className="btn btn-secondary btn-sm">
                    View All Products
                  </Link>
                </div>

                <div className="table-responsive">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Farmer Origin</th>
                        <th>QR Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentProducts?.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--primary-800)',
                                backgroundColor: 'var(--primary-50)',
                                padding: '0.2rem 0.45rem',
                                borderRadius: '4px',
                                border: '1px solid var(--primary-200)',
                              }}
                            >
                              {product.batchId}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                              ₹{product.pricePerUnit} / {product.unit}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {product.quantity.toLocaleString()} {product.unit}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            <div>{product.farmer?.name || 'Local Farm'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                              {product.farmer?.location?.district || 'Agricultural Zone'}
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedProductQR(product)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <QrCode size={13} color="var(--primary-700)" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* QR Code Inspection Modal */}
        <QRCodeModal
          isOpen={!!selectedProductQR}
          onClose={() => setSelectedProductQR(null)}
          product={selectedProductQR}
        />
      </main>
    </div>
  );
};
