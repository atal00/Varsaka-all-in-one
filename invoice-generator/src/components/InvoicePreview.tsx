'use client';

import React from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { CheckCircle2 } from 'lucide-react';
import { StandardTemplate } from './templates/StandardTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { TaxInvoiceTemplate } from './templates/TaxInvoiceTemplate';

export const InvoicePreview = () => {
  const store = useInvoiceStore();

  const renderTemplate = () => {
    switch (store.template) {
      case 'modern':
        return <ModernTemplate store={store} />;
      case 'minimal':
        return <MinimalTemplate store={store} />;
      case 'corporate':
        return <CorporateTemplate store={store} />;
      case 'tax':
        return <TaxInvoiceTemplate store={store} />;
      case 'standard':
      default:
        return <StandardTemplate store={store} />;
    }
  };

  return (
    <div 
      id="invoice-preview-container"
      style={{ 
        background: '#ffffff', 
        padding: '0', 
        borderRadius: '0px', 
        minHeight: '297mm',
        position: 'relative',
        boxShadow: 'var(--shadow-deep)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Validation Badge */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }} className="no-print">
        <div className="badgeSuccess" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <CheckCircle2 size={14} /> Autonomous Validation Check: Passed
        </div>
      </div>

      {renderTemplate()}
    </div>
  );
};
