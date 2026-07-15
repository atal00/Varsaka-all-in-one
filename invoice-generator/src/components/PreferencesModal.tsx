'use client';

import React from 'react';
import { useProfileStore } from '@/store/profileStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { sender, paymentDetails, updateProfile } = useProfileStore();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
      }}>
        {/* Header Area */}
        <div style={{ padding: '2rem 2rem 1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Global Preferences</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Save your global company profile and bank details here. These will be automatically filled whenever you create a new invoice.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem -0.5rem 0 0' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Sender Profile */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Company / Sender Profile</h3>
            
            <div style={{ marginBottom: '1rem' }}>
               <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Company Logo</label>
               <input type="file" accept="image/*" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onloadend = () => {
                     updateProfile({ sender: { ...sender, logoUrl: reader.result as string } });
                   };
                   reader.readAsDataURL(file);
                 }
               }} style={{ padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', width: '100%' }} />
               {sender.logoUrl && (
                 <Button variant="secondary" onClick={() => updateProfile({ sender: { ...sender, logoUrl: undefined } })} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                   Remove Logo
                 </Button>
               )}
            </div>

            <Input 
              label="Company Name" 
              value={sender.name} 
              onChange={e => updateProfile({ sender: { ...sender, name: e.target.value } })} 
            />
            <Input 
              label="Email Address" 
              value={sender.email} 
              onChange={e => updateProfile({ sender: { ...sender, email: e.target.value } })} 
            />
            <Input 
              label="Phone Number" 
              value={sender.phone} 
              onChange={e => updateProfile({ sender: { ...sender, phone: e.target.value } })} 
            />
            <Input 
              label="Address" 
              value={sender.address} 
              onChange={e => updateProfile({ sender: { ...sender, address: e.target.value } })} 
            />
          </div>

          {/* Payment Details */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Global Bank Details</h3>
            <Input 
              label="Bank Name" 
              value={paymentDetails.bankName} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, bankName: e.target.value } })} 
            />
            <Input 
              label="Account Name" 
              value={paymentDetails.accountName} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, accountName: e.target.value } })} 
            />
            <Input 
              label="Account Number" 
              value={paymentDetails.accountNumber} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, accountNumber: e.target.value } })} 
            />
            <Input 
              label="Routing / SWIFT Code" 
              value={paymentDetails.routingCode} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, routingCode: e.target.value } })} 
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
          <Button onClick={() => {
            toast.success("Preferences saved globally!");
            onClose();
          }}>Save & Close</Button>
        </div>
      </div>
    </div>
  </div>
  );
}
