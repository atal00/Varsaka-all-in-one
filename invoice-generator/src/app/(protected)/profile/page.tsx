'use client';

import React from 'react';
import { useProfileStore } from '@/store/profileStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const { sender, paymentDetails, updateProfile } = useProfileStore();

  const handleSave = () => {
    toast.success("Profile saved successfully!");
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Company Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            These details will automatically populate as the "Sender" when you create new invoices.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Sender Profile */}
        <Card>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Sender Details</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
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
               <div style={{ marginTop: '1rem' }}>
                 <img src={sender.logoUrl} alt="Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                 <div>
                   <Button variant="secondary" onClick={() => updateProfile({ sender: { ...sender, logoUrl: undefined } })} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                     Remove Logo
                   </Button>
                 </div>
               </div>
             )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <Input 
              label="Tax ID / GSTIN" 
              value={sender.taxId || ''} 
              onChange={e => updateProfile({ sender: { ...sender, taxId: e.target.value } })} 
              placeholder="e.g. 22AAAAA0000A1Z5"
            />
          </div>
        </Card>

        {/* Payment Details */}
        <Card>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Bank Details</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Optional. These bank details will appear at the bottom of your invoices for clients to remit payments.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              label="Routing Code (Optional)" 
              value={paymentDetails.routingCode} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, routingCode: e.target.value } })} 
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input 
                label="IFSC Code" 
                value={paymentDetails.ifscCode || ''} 
                onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, ifscCode: e.target.value } })} 
              />
              <Input 
                label="SWIFT Code" 
                value={paymentDetails.swiftCode || ''} 
                onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, swiftCode: e.target.value } })} 
              />
            </div>
            <Input 
              label="Bank Address" 
              value={paymentDetails.bankAddress || ''} 
              onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, bankAddress: e.target.value } })} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Bank Notes / Instructions</label>
              <textarea 
                value={paymentDetails.bankNotes || ''}
                onChange={e => updateProfile({ paymentDetails: { ...paymentDetails, bankNotes: e.target.value } })}
                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', minHeight: '80px', fontFamily: 'inherit', fontSize: '0.95rem' }}
                placeholder="e.g. Please include invoice number as payment reference"
              />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <Button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', fontSize: '1rem' }}>
          <Save size={18} /> Save Changes
        </Button>
      </div>
    </div>
  );
}
