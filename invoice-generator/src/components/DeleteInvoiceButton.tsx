'use client';

import React, { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteInvoice } from '@/actions/invoice';
import toast from 'react-hot-toast';

interface DeleteInvoiceButtonProps {
  invoiceId: string;
}

export function DeleteInvoiceButton({ invoiceId }: DeleteInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    startTransition(async () => {
      try {
        await deleteInvoice(invoiceId);
        toast.success('Invoice deleted successfully');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete invoice');
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title={isPending ? 'Deleting...' : 'Delete'}
      style={{
        padding: '0.4rem',
        background: 'transparent',
        cursor: isPending ? 'not-allowed' : 'pointer',
        color: isPending ? 'var(--text-muted)' : '#dc2626',
        border: '1px solid transparent',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isPending ? 0.6 : 1,
        transition: 'all 0.2s'
      }}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}

export default DeleteInvoiceButton;
