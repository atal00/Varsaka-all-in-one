import React from 'react';
import { InvoiceState } from '@/store/invoiceStore';

export const ModernTemplate = ({ store }: { store: InvoiceState }) => {
  const { calculations } = store;
  const themeColor = store.themeColor || 'var(--accent-primary)';

  return (
    <div style={{ padding: '0', fontFamily: store.fontFamily || 'var(--font-inter)' }}>
      {/* Full Width Colored Header */}
      <div style={{ backgroundColor: themeColor, color: '#ffffff', padding: '3.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {store.sender.logoUrl && (
            <img src={store.sender.logoUrl} alt="Logo" style={{ maxHeight: '70px', marginBottom: '1.5rem', objectFit: 'contain' }} />
          )}
          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '0.25rem', letterSpacing: '-0.05em', fontWeight: 800 }}>INVOICE</h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>#{store.invoicePrefix}{store.invoiceNumber}</p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 700 }}>{store.sender.name || 'Your Company'}</h2>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{store.sender.email}</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{store.sender.phone}</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.9, whiteSpace: 'pre-wrap' }}>{store.sender.address}</p>
          {store.sender.taxId && <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>GSTIN / Tax ID: {store.sender.taxId}</p>}
        </div>
      </div>

      <div style={{ padding: '3.5rem' }}>
        {/* Two Column Info Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Bill To */}
          <div>
            <h3 style={{ fontSize: '0.875rem', color: themeColor, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em', fontWeight: 700 }}>Billed To</h3>
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
          
          {/* Invoice Details */}
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '0.875rem', color: themeColor, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em', fontWeight: 700 }}>Invoice Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.25rem 1rem', fontSize: '0.95rem', color: '#475569', justifyContent: 'end', textAlign: 'right' }}>
              {store.poCode && <><strong style={{ color: '#0f172a' }}>PO Code:</strong> <span>{store.poCode}</span></>}
              <strong style={{ color: '#0f172a' }}>Date of Issue:</strong> <span>{store.issueDate}</span>
              <strong style={{ color: '#0f172a' }}>Due Date:</strong> <span>{store.dueDate}</span>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'inline-block', backgroundColor: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '0.5rem', borderLeft: `4px solid ${themeColor}` }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem', textAlign: 'right' }}>Total Amount Due</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>{store.currency} {calculations.total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
          {(() => {
            const hasTaxes = store.lineItems.some(i => i.taxRate && i.taxRate > 0);
            const colSpanSubTotal = hasTaxes ? 4 : 3;
            const colSpanTotals = hasTaxes ? 5 : 4;

            return (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
                    <th style={{ textAlign: 'left', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Unit</th>
                    <th style={{ textAlign: 'right', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Rate</th>
                    {hasTaxes && (
                      <th style={{ textAlign: 'right', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>IGST</th>
                    )}
                    <th style={{ textAlign: 'right', padding: '1rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', fontWeight: 700 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {store.lineItems.map((item, index) => {
                    const itemTotal = item.quantity * item.rate;
                    const discountRatio = calculations.subtotal > 0 ? calculations.discountAmount / calculations.subtotal : 0;
                    const effectiveTotal = itemTotal * (1 - discountRatio);
                    const taxAmount = effectiveTotal * ((item.taxRate || 0) / 100);
                    const amountIncludingTax = itemTotal + taxAmount;
                    
                    return (
                      <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                        <td style={{ padding: '1.25rem' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name || 'Item Description'}</div>
                          {item.description && <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{item.description}</div>}
                        </td>
                        <td style={{ textAlign: 'right', padding: '1.25rem', color: '#334155' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '1.25rem', color: '#334155' }}>{item.unit}</td>
                        <td style={{ textAlign: 'right', padding: '1.25rem', color: '#334155' }}>{store.currency} {item.rate.toFixed(2)}</td>
                        {hasTaxes && (
                          <td style={{ textAlign: 'right', padding: '1.25rem', color: '#334155' }}>
                            {item.taxRate ? (
                              <>
                                <div>{taxAmount.toFixed(2)}</div>
                                <div style={{ fontSize: '0.8em', color: '#64748b' }}>{item.taxRate}%</div>
                              </>
                            ) : '-'}
                          </td>
                        )}
                        <td style={{ textAlign: 'right', padding: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{store.currency} {amountIncludingTax.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <td colSpan={colSpanSubTotal} style={{ textAlign: 'right', padding: '1rem 1.25rem', fontWeight: 600, color: '#475569' }}>Subtotal</td>
                    {hasTaxes && (
                      <td style={{ textAlign: 'right', padding: '1rem 1.25rem', color: '#334155' }}>{calculations.totalItemTax.toFixed(2)}</td>
                    )}
                    <td style={{ textAlign: 'right', padding: '1rem 1.25rem', color: '#0f172a', fontWeight: 500 }}>{store.currency} {(calculations.subtotal + calculations.totalItemTax).toFixed(2)}</td>
                  </tr>
                  {calculations.discountAmount > 0 && (
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.75rem 1.25rem', color: '#ef4444' }}>
                        Discount ({store.discountType === 'percentage' ? `${store.discountValue}%` : 'Fixed'})
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem 1.25rem', color: '#ef4444', fontWeight: 500 }}>-{store.currency} {calculations.discountAmount.toFixed(2)}</td>
                    </tr>
                  )}
                  {calculations.taxAmount1 > 0 && (
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.75rem 1.25rem', color: '#ef4444' }}>
                        Amount Withheld (TDS)
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem 1.25rem', color: '#ef4444', fontWeight: 500 }}>-{store.currency}{calculations.taxAmount1.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '1px solid #e2e8f0', backgroundColor: themeColor, color: '#ffffff' }}>
                    <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '1.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
                      Total
                    </td>
                    <td style={{ textAlign: 'right', padding: '1.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
                      {store.currency} {calculations.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            );
          })()}
        </div>

        {/* Footer Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {store.notes && (
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', borderLeft: `4px solid ${themeColor}` }}>
              <h4 style={{ fontSize: '0.8125rem', color: themeColor, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Notes & Terms</h4>
              <p style={{ fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>{store.notes}</p>
            </div>
          )}

          {store.paymentDetails && (store.paymentDetails.bankName || store.paymentDetails.accountNumber) && (
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', borderLeft: `4px solid ${themeColor}` }}>
              <h4 style={{ fontSize: '0.8125rem', color: themeColor, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Payment Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem', fontSize: '0.875rem', color: '#334155' }}>
                {store.paymentDetails.bankName && <><strong style={{ color: '#0f172a' }}>Bank:</strong> <span>{store.paymentDetails.bankName}</span></>}
                {store.paymentDetails.accountName && <><strong style={{ color: '#0f172a' }}>Account Name:</strong> <span>{store.paymentDetails.accountName}</span></>}
                {store.paymentDetails.accountNumber && <><strong style={{ color: '#0f172a' }}>Account No:</strong> <span>{store.paymentDetails.accountNumber}</span></>}
                {store.paymentDetails.ifscCode && <><strong style={{ color: '#0f172a' }}>IFSC Code:</strong> <span>{store.paymentDetails.ifscCode}</span></>}
                {store.paymentDetails.swiftCode && <><strong style={{ color: '#0f172a' }}>SWIFT Code:</strong> <span>{store.paymentDetails.swiftCode}</span></>}
                {store.paymentDetails.routingCode && <><strong style={{ color: '#0f172a' }}>Routing Code:</strong> <span>{store.paymentDetails.routingCode}</span></>}
                {store.paymentDetails.bankAddress && <><strong style={{ color: '#0f172a' }}>Bank Address:</strong> <span>{store.paymentDetails.bankAddress}</span></>}
              </div>
              {store.paymentDetails.bankNotes && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {store.paymentDetails.bankNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
