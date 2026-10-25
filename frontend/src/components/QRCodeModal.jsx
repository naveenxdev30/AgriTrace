import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Copy, Download, ExternalLink, Printer, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const QRCodeModal = ({ isOpen, onClose, product }) => {
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const qrRef = useRef();

  if (!product) return null;

  const traceUrl = `${window.location.origin}/trace/${product.batchId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(traceUrl);
    showSuccess(`Traceability URL for batch ${product.batchId} copied to clipboard!`);
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 80;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      
      // Add batch ID text beneath
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#1b5e20';
      ctx.textAlign = 'center';
      ctx.fillText(product.batchId, canvas.width / 2, canvas.height - 30);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('AgriTrace Verified Batch', canvas.width / 2, canvas.height - 12);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `AgriTrace-${product.batchId}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      showSuccess(`QR code downloaded as PNG.`);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNavigateTrace = () => {
    onClose();
    navigate(`/trace/${product.batchId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Batch QR Code & Traceability Tag"
      maxWidth="460px"
      footer={
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleNavigateTrace}>
            <ExternalLink size={14} /> Open Trace View
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadQR}>
            <Download size={14} /> Download PNG
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        <div
          ref={qrRef}
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--primary-300)',
            display: 'inline-block',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1rem',
          }}
        >
          <QRCodeSVG
            value={traceUrl}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#15803d"
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--primary-800)',
              letterSpacing: '0.05em',
            }}
          >
            {product.batchId}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--neutral-800)', marginTop: '0.25rem' }}>
            {product.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.15rem' }}>
            Quantity: {product.quantity} {product.unit} • {product.qualityGrade || 'Grade A'}
          </div>
        </div>

        {/* Traceability Link Copy Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--neutral-100)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--neutral-200)',
            gap: '0.5rem',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--neutral-600)',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {traceUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            title="Copy URL"
          >
            <Copy size={13} /> Copy
          </button>
        </div>
      </div>
    </Modal>
  );
};
