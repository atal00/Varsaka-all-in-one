import React from 'react';
import { InvoiceState } from '@/store/invoiceStore';

export const StandardTemplate = ({ store }: { store: InvoiceState }) => {
  const { calculations } = store;
  const themeColor = store.themeColor || 'var(--accent-primary)';

  return (
    <div style={{ padding: '3.5rem', fontFamily: store.fontFamily || 'var(--font-inter)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: themeColor, marginBottom: '0.5rem', letterSpacing: '-0.05em', fontWeight: 800 }}>INVOICE</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>Invoice No:</strong> <span>{store.invoicePrefix}{store.invoiceNumber}</span>
            {store.poCode && <><strong style={{ color: '#0f172a' }}>PO Code:</strong> <span>{store.poCode}</span></>}
            <strong style={{ color: '#0f172a' }}>Date:</strong> <span>{store.issueDate}</span>
            <strong style={{ color: '#0f172a' }}>Due Date:</strong> <span>{store.dueDate}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: '300px' }}>
          {store.sender.logoUrl && (
            <img src={store.sender.logoUrl} alt="Logo" style={{ maxHeight: '70px', marginBottom: '1rem', objectFit: 'contain', float: 'right' }} />
          )}
          <div style={{ clear: 'both' }}></div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 700, color: '#0f172a' }}>{store.sender.name || 'Your Company'}</h2>
          <p style={{ fontSize: '0.9rem', color: '#475569' }}>{store.sender.email}</p>
          <p style={{ fontSize: '0.9rem', color: '#475569' }}>{store.sender.phone}</p>
          <p style={{ fontSize: '0.9rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{store.sender.address}</p>
          {store.sender.taxId && <p style={{ fontSize: '0.9rem', color: '#475569' }}>GSTIN / Tax ID: {store.sender.taxId}</p>}
        </div>
      </div>

      <div style={{ borderTop: '2px solid #e2e8f0', margin: '2rem 0' }} />

      {/* Bill To */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Bill To</h3>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 600, color: '#0f172a' }}>{store.client.name || 'Client Name'}</h2>
        <p style={{ color: '#475569', fontSize: '0.95rem' }}>{store.client.email}</p>
        <div style={{ color: '#475569', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
          {store.client.billingStreet1 || store.client.billingCity ? (
            <>
              {store.client.billingAttention && <div>Attn: {store.client.billingAttention}</div>}
              {store.client.billingStreet1 && <div>{store.client.billingStreet1}</div>}
              {store.client.billingStreet2 && <div>{store.client.billingStreet2}</div>}
              <div>{[store.client.billingCity, store.client.billingState, store.client.billingPinCode].filter(Boolean).join(', ')}</div>
              {store.client.billingCountry && <div>{store.client.billingCountry}</div>}
              {store.client.billingPhone && <div>Phone: {store.client.billingPhone}</div>}
            </>
          ) : store.client.address}
        </div>
        {store.client.taxId && <p style={{ color: '#475569', fontSize: '0.95rem' }}>GSTIN / Tax ID: {store.client.taxId}</p>}
      </div>

      {/* Line Items */}
      {/* Line Items */}
      {(() => {
        const hasTaxes = store.lineItems.some(i => i.taxRate && i.taxRate > 0);
        const colSpanSubTotal = hasTaxes ? 4 : 3;
        const colSpanTotals = hasTaxes ? 5 : 4;
        
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0f172a' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Unit</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Rate</th>
                {hasTaxes && (
                  <th style={{ textAlign: 'right', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>IGST</th>
                )}
                <th style={{ textAlign: 'right', padding: '0.75rem 0', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {store.lineItems.map((item) => {
                const itemTotal = item.quantity * item.rate;
                const discountRatio = calculations.subtotal > 0 ? calculations.discountAmount / calculations.subtotal : 0;
                const effectiveTotal = itemTotal * (1 - discountRatio);
                const taxAmount = effectiveTotal * ((item.taxRate || 0) / 100);
                const amountIncludingTax = itemTotal + taxAmount;
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1.25rem 0' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name || 'Item Description'}</div>
                      {item.description && <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#334155' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#334155' }}>{item.unit}</td>
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#334155' }}>{store.currency} {item.rate.toFixed(2)}</td>
                    {hasTaxes && (
                      <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#334155' }}>
                        {item.taxRate ? (
                          <>
                            <div>{taxAmount.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8em', color: '#64748b' }}>{item.taxRate}%</div>
                          </>
                        ) : '-'}
                      </td>
                    )}
                    <td style={{ textAlign: 'right', padding: '1.25rem 0', fontWeight: 600, color: '#0f172a' }}>{store.currency} {amountIncludingTax.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={colSpanSubTotal} style={{ textAlign: 'right', padding: '0.75rem 0', fontWeight: 600, color: '#475569' }}>Subtotal</td>
                {hasTaxes && (
                  <td style={{ textAlign: 'right', padding: '0.75rem 0', color: '#334155' }}>{calculations.totalItemTax.toFixed(2)}</td>
                )}
                <td style={{ textAlign: 'right', padding: '0.75rem 0', color: '#0f172a', fontWeight: 500 }}>{store.currency} {(calculations.subtotal + calculations.totalItemTax).toFixed(2)}</td>
              </tr>
              {calculations.discountAmount > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', color: '#ef4444' }}>
                    Discount ({store.discountType === 'percentage' ? `${store.discountValue}%` : 'Fixed'})
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#ef4444', fontWeight: 500 }}>-{store.currency} {calculations.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              {calculations.taxAmount1 > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', color: '#ef4444' }}>
                    Amount Withheld (TDS)
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#ef4444', fontWeight: 500 }}>-{store.currency}{calculations.taxAmount1.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '1rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', borderTop: '2px solid #e2e8f0' }}>
                  Grand Total
                </td>
                <td style={{ textAlign: 'right', padding: '1rem 0', fontSize: '1.25rem', fontWeight: 700, color: themeColor, borderTop: '2px solid #e2e8f0' }}>
                  {store.currency} {calculations.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        );
      })()}

      {/* Footer Notes */}
      <div style={{ marginTop: 'auto' }}>
        {store.notes && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.375rem', fontWeight: 600 }}>Notes & Terms</h4>
            <p style={{ fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{store.notes}</p>
          </div>
        )}

        {store.paymentDetails && (store.paymentDetails.bankName || store.paymentDetails.accountNumber) && (
          <div>
            <h4 style={{ fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Payment Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem', fontSize: '0.875rem', color: '#334155' }}>
              {store.paymentDetails.bankName && <><strong style={{ color: '#0f172a' }}>Bank Name:</strong> <span>{store.paymentDetails.bankName}</span></>}
              {store.paymentDetails.accountName && <><strong style={{ color: '#0f172a' }}>Account Name:</strong> <span>{store.paymentDetails.accountName}</span></>}
              {store.paymentDetails.accountNumber && <><strong style={{ color: '#0f172a' }}>Account No:</strong> <span>{store.paymentDetails.accountNumber}</span></>}
              {store.paymentDetails.ifscCode && <><strong style={{ color: '#0f172a' }}>IFSC Code:</strong> <span>{store.paymentDetails.ifscCode}</span></>}
              {store.paymentDetails.swiftCode && <><strong style={{ color: '#0f172a' }}>SWIFT Code:</strong> <span>{store.paymentDetails.swiftCode}</span></>}
              {store.paymentDetails.routingCode && <><strong style={{ color: '#0f172a' }}>Routing Code:</strong> <span>{store.paymentDetails.routingCode}</span></>}
              {store.paymentDetails.bankAddress && <><strong style={{ color: '#0f172a' }}>Bank Address:</strong> <span>{store.paymentDetails.bankAddress}</span></>}
            </div>
            {store.paymentDetails.bankNotes && (
              <p style={{ fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{store.paymentDetails.bankNotes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
