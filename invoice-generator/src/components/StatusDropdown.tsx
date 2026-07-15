'use client';

import React, { useTransition } from 'react';
import { updateInvoiceStatus } from '@/actions/invoice';
import toast from 'react-hot-toast';

interface StatusDropdownProps {
  invoiceId: string;
  initialStatus: string;
}

export function StatusDropdown({ invoiceId, initialStatus }: StatusDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      try {
        await updateInvoiceStatus(invoiceId, newStatus);
        toast.success(`Status updated to ${newStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
      }
    });
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid': return 'badgeSuccess'; // we have badgeSuccess in globals.css maybe? Or inline styles.
      default: return '';
    }
  };

  return (
    <select
      value={initialStatus}
      onChange={handleStatusChange}
      disabled={isPending}
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        border: '1px solid var(--border-light)',
        fontSize: '0.875rem',
        background: 'transparent',
        cursor: 'pointer',
        color: initialStatus === 'Paid' ? '#10b981' : (initialStatus === 'Overdue' ? '#ef4444' : 'var(--text-primary)'),
        fontWeight: 600
      }}
    >
      <option value="Draft">Draft</option>
      <option value="Pending">Pending</option>
      <option value="Paid">Paid</option>
      <option value="Overdue">Overdue</option>
    </select>
  );
}
