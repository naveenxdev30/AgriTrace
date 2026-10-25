import React from 'react';
import { Truck, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export const StatusBadge = ({ status = 'Pending', type = 'shipment' }) => {
  const norm = String(status).toLowerCase();

  // Shipments & Products
  if (norm.includes('transit')) {
    return (
      <span className="badge badge-in-transit">
        <Truck size={12} />
        In Transit
      </span>
    );
  }

  if (norm.includes('delivered') || norm.includes('sold')) {
    return (
      <span className="badge badge-delivered">
        <CheckCircle size={12} />
        {status}
      </span>
    );
  }

  if (norm.includes('pending') || norm.includes('harvested') || norm.includes('stored')) {
    return (
      <span className="badge badge-pending">
        <Clock size={12} />
        {status}
      </span>
    );
  }

  // Certifications
  if (norm.includes('organic')) {
    return (
      <span className="badge badge-organic">
        <ShieldCheck size={12} />
        {status}
      </span>
    );
  }

  if (norm.includes('delayed') || norm.includes('audit')) {
    return (
      <span className="badge badge-pending">
        <AlertTriangle size={12} />
        {status}
      </span>
    );
  }

  return (
    <span className="badge badge-standard">
      <ShieldCheck size={12} />
      {status}
    </span>
  );
};
