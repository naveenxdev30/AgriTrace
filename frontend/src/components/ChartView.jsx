import React, { useState } from 'react';

export const MonthlyHarvestBarChart = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return <div>No data available</div>;

  const maxVal = Math.max(...data.map((d) => d.volume), 50000);
  const chartHeight = 180;
  const chartWidth = 480;
  const barWidth = 36;
  const gap = (chartWidth - data.length * barWidth) / (data.length + 1);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
        style={{ width: '100%', maxHeight: '240px', overflow: 'visible' }}
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = chartHeight - pct * chartHeight + 10;
          return (
            <g key={i}>
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={4}
                y={y - 4}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="var(--font-sans)"
              >
                {Math.round((maxVal * pct) / 1000)}k kg
              </text>
            </g>
          );
        })}

        {/* Data Bars */}
        {data.map((item, idx) => {
          const barHeight = (item.volume / maxVal) * chartHeight;
          const x = gap + idx * (barWidth + gap);
          const y = chartHeight - barHeight + 10;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Main Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={isHovered ? '#15803d' : '#22c55e'}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Month Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 30}
                textAnchor="middle"
                fill={isHovered ? '#15803d' : '#64748b'}
                fontWeight={isHovered ? 700 : 500}
                fontSize="12"
              >
                {item.month}
              </text>

              {/* Tooltip / value */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 45}
                    y={y - 28}
                    width={90}
                    height={22}
                    rx={4}
                    fill="#0f172a"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 13}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight={600}
                  >
                    {item.volume.toLocaleString()} kg
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const ShipmentStatusDonutChart = ({ stats = [] }) => {
  const colorMap = {
    'In Transit': '#2563eb',
    Delivered: '#16a34a',
    Pending: '#eab308',
    Delayed: '#ef4444',
  };

  const total = stats.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
        {stats.map((s, idx) => {
          const widthPct = (s.count / total) * 100;
          return (
            <div
              key={idx}
              style={{
                width: `${widthPct}%`,
                backgroundColor: colorMap[s._id] || '#94a3b8',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
              title={`${s._id}: ${s.count} (${Math.round(widthPct)}%)`}
            />
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
        {stats.map((s, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: colorMap[s._id] || '#94a3b8',
              }}
            />
            <span style={{ color: 'var(--neutral-600)' }}>{s._id}:</span>
            <strong style={{ color: 'var(--neutral-900)' }}>{s.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
