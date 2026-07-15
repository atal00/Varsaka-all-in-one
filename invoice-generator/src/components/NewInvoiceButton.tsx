'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useProfileStore } from '@/store/profileStore';
import toast from 'react-hot-toast';

export function NewInvoiceButton() {
  const router = useRouter();
  const createNewInvoice = useInvoiceStore((state) => state.createNewInvoice);
  const profile = useProfileStore();

  const handleCreateNew = () => {
    createNewInvoice(profile);
    toast.success("New invoice drafted with your global settings!");
    router.push('/app');
  };

  return (
    <Button onClick={handleCreateNew}>
      <Plus size={16} /> New Invoice
    </Button>
  );
}
