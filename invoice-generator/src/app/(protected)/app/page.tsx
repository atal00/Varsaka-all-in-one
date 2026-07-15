'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceEditor } from '@/components/InvoiceEditor';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Button } from '@/components/ui/Button';
import { Download, Save } from 'lucide-react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { useProfileStore } from '@/store/profileStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveInvoiceToDb } from '@/actions/invoice';
import toast from 'react-hot-toast';

export default function CoreGeneratorApp() {
  const store = useInvoiceStore();
  const profile = useProfileStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    store.recalculate();
  }, []);

  useEffect(() => {
    if (mounted && !store.sender.name && profile.sender.name) {
      store.setSender(profile.sender);
      store.setInvoiceDetails({ paymentDetails: profile.paymentDetails });
    }
  }, [mounted, store.sender.name, profile.sender.name, profile.paymentDetails]);

  if (!mounted) return null;

  const handleExportPDF = async () => {
    const element = document.getElementById('invoice-preview-container');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${store.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: store.id,
        invoiceNumber: store.invoiceNumber,
        poCode: store.poCode,
        issueDate: store.issueDate,
        dueDate: store.dueDate,
        template: store.template,
        senderName: store.sender.name,
        senderEmail: store.sender.email,
        senderPhone: store.sender.phone,
        senderAddress: store.sender.address,
        logoUrl: store.sender.logoUrl,
        clientName: store.client.name,
        clientEmail: store.client.email,
        clientAddress: store.client.address,
        discountType: store.discountType,
        discountValue: store.discountValue,
        taxRate1: store.taxRate1,
        taxRate2: store.taxRate2,
        currency: store.currency,
        notes: store.notes,
        terms: store.terms,
        status: 'Pending',
        themeColor: store.themeColor,
        bankName: store.paymentDetails.bankName,
        accountName: store.paymentDetails.accountName,
        accountNumber: store.paymentDetails.accountNumber,
        routingCode: store.paymentDetails.routingCode,
        ifscCode: store.paymentDetails.ifscCode,
        swiftCode: store.paymentDetails.swiftCode,
        bankAddress: store.paymentDetails.bankAddress,
        bankNotes: store.paymentDetails.bankNotes,
        subtotal: store.calculations.subtotal,
        total: store.calculations.total,
        lineItems: store.lineItems.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          unit: item.unit
        }))
      };
      
      await saveInvoiceToDb(payload);
      toast.success("Invoice successfully saved to the cloud!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Generator Module</h2>
      </div>

      <div>
        <InvoiceEditor />
      </div>

      {/* Bottom Action Bar */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0' }}>
          <Button variant="secondary" onClick={handleSaveToCloud} disabled={isSaving} style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>
            <Save size={18} style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Saving...' : 'Save Invoice'}
          </Button>
          <Button onClick={() => setIsPreviewOpen(true)} style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>
            Preview & Download
          </Button>
      </div>

      {isPreviewOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '950px', position: 'relative' }}>
             <button onClick={() => setIsPreviewOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
             
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invoice Preview</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Template:</label>
                    <select 
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', backgroundColor: '#f8fafc' }}
                      value={store.template} 
                      onChange={e => store.setInvoiceDetails({ template: e.target.value })}
                    >
                      <option value="standard">Standard Professional</option>
                      <option value="modern">Modern Clean</option>
                      <option value="minimal">Minimalist</option>
                      <option value="corporate">Corporate (Compact)</option>
                      <option value="tax">Tax Invoice</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Typography:</label>
                    <select 
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', backgroundColor: '#f8fafc', fontFamily: store.fontFamily }}
                      value={store.fontFamily} 
                      onChange={e => store.setInvoiceDetails({ fontFamily: e.target.value })}
                    >
                      <option value="var(--font-inter)" style={{ fontFamily: 'var(--font-inter)' }}>Inter</option>
                      <option value="var(--font-roboto)" style={{ fontFamily: 'var(--font-roboto)' }}>Roboto</option>
                      <option value="var(--font-playfair)" style={{ fontFamily: 'var(--font-playfair)' }}>Playfair</option>
                      <option value="var(--font-outfit)" style={{ fontFamily: 'var(--font-outfit)' }}>Outfit</option>
                      <option value="var(--font-mono)" style={{ fontFamily: 'var(--font-mono)' }}>Space Mono</option>
                    </select>
                  </div>

                  <Button onClick={handleExportPDF} disabled={isExporting}>
                    <Download size={16} /> {isExporting ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                </div>
             </div>
             
             <div style={{ width: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
               <InvoicePreview />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
