import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', subtitle, color = 'green' }) => {
  const colorMap = {
    green: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    amber: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    blue: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    purple: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
  };

  const scheme = colorMap[color] || colorMap.green;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-500)' }}>
          {title}
        </span>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: scheme.bg,
            color: scheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {change && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: changeType === 'positive' ? '#16a34a' : '#dc2626',
            }}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
