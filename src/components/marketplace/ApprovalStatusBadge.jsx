import React from 'react';

const styles = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const labels = {
  PENDING_APPROVAL: 'Pending Approval',
  ACTIVE: 'Active',
  APPROVED: 'Approved',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};

const labelsAr = {
  PENDING_APPROVAL: 'قيد المراجعة',
  ACTIVE: 'نشط',
  APPROVED: 'مقبول',
  SUSPENDED: 'معلق',
  REJECTED: 'مرفوض',
};

export default function ApprovalStatusBadge({ status, isArabic = false }) {
  const finalStatus = status ? status.toUpperCase() : 'PENDING_APPROVAL';
  
  // Map boolean to string status if needed, though usually we pass the enum string
  // If isApproved boolean comes in, handle it?
  // Ideally backend sends strings. If boolean: true -> APPROVED/ACTIVE, false -> ?
  
  const className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[finalStatus] || 'bg-gray-100 text-gray-800'}`;
  
  const label = isArabic ? labelsAr[finalStatus] : labels[finalStatus];

  return (
    <span className={className}>
      {label || status}
    </span>
  );
}
