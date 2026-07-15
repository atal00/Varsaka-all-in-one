import React from 'react';
import { InvoiceState } from '@/store/invoiceStore';

export const MinimalTemplate = ({ store }: { store: InvoiceState }) => {
  const { calculations } = store;

  return (
    <div style={{ padding: '4rem', fontFamily: store.fontFamily || 'var(--font-mono)', color: '#000000', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        {store.sender.logoUrl && (
          <img src={store.sender.logoUrl} alt="Logo" style={{ maxHeight: '80px', marginBottom: '2rem', objectFit: 'contain' }} />
        )}
        <h1 style={{ fontSize: '3rem', letterSpacing: '0.1em', fontWeight: 300, textTransform: 'uppercase', marginBottom: '1rem' }}>Invoice</h1>
        <p style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>{store.invoicePrefix}{store.invoiceNumber}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
        {/* From */}
        <div>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>From</h3>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{store.sender.name || 'Your Company'}</h2>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <div>{store.sender.email}</div>
            <div>{store.sender.phone}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{store.sender.address}</div>
            {store.sender.taxId && <div>GSTIN: {store.sender.taxId}</div>}
          </div>
        </div>

        {/* To */}
        <div>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #000', paddingBottom: '0.5rem', marginBottom: '1rem' }}>To</h3>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{store.client.name || 'Client Name'}</h2>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <div>{store.client.email}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>
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
            {store.client.taxId && <div>GSTIN: {store.client.taxId}</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '4rem', fontSize: '0.875rem' }}>
        <div>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Date</span>
          <strong>{store.issueDate}</strong>
        </div>
        <div>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Due Date</span>
          <strong>{store.dueDate}</strong>
        </div>
        {store.poCode && (
          <div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>PO Code</span>
            <strong>{store.poCode}</strong>
          </div>
        )}
      </div>

      {/* Line Items */}
      {(() => {
        const hasTaxes = store.lineItems.some(i => i.taxRate && i.taxRate > 0);
        const colSpanSubTotal = hasTaxes ? 3 : 2;
        const colSpanTotals = hasTaxes ? 4 : 3;

        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '1rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>Item</th>
                <th style={{ textAlign: 'right', padding: '1rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '1rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>Price</th>
                {hasTaxes && (
                  <th style={{ textAlign: 'right', padding: '1rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>IGST</th>
                )}
                <th style={{ textAlign: 'right', padding: '1rem 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>Total</th>
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
                  <tr key={item.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '1.5rem 0' }}>
                      <div style={{ fontWeight: 600 }}>{item.name || 'Item Description'}</div>
                      {item.description && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#666' }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '1.5rem 0' }}>{item.quantity} {item.unit !== 'hrs' && item.unit !== 'qty' ? item.unit : ''}</td>
                    <td style={{ textAlign: 'right', padding: '1.5rem 0' }}>{store.currency} {item.rate.toFixed(2)}</td>
                    {hasTaxes && (
                      <td style={{ textAlign: 'right', padding: '1.5rem 0' }}>
                        {item.taxRate ? (
                          <>
                            <div>{taxAmount.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{item.taxRate}%</div>
                          </>
                        ) : '-'}
                      </td>
                    )}
                    <td style={{ textAlign: 'right', padding: '1.5rem 0', fontWeight: 600 }}>{store.currency} {amountIncludingTax.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={colSpanSubTotal} style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 600, fontSize: '0.875rem' }}>Subtotal</td>
                {hasTaxes && (
                  <td style={{ textAlign: 'right', padding: '1rem 0', fontSize: '0.875rem' }}>{calculations.totalItemTax.toFixed(2)}</td>
                )}
                <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 600, fontSize: '0.875rem' }}>{store.currency} {(calculations.subtotal + calculations.totalItemTax).toFixed(2)}</td>
              </tr>
              {calculations.discountAmount > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                    Discount ({store.discountType === 'percentage' ? `${store.discountValue}%` : 'Fixed'})
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>-{store.currency} {calculations.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              {calculations.taxAmount1 > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                    Amount Withheld (TDS)
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>-{store.currency} {calculations.taxAmount1.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '1.5rem 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
                  Total
                </td>
                <td style={{ textAlign: 'right', padding: '1.5rem 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
                  {store.currency} {calculations.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        );
      })()}

      {/* Footer Notes */}
      <div style={{ borderTop: '1px solid #000', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', lineHeight: 1.6 }}>
        {store.notes && (
          <div style={{ maxWidth: '45%' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>Notes</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{store.notes}</div>
          </div>
        )}

        {store.paymentDetails && (store.paymentDetails.bankName || store.paymentDetails.accountNumber) && (
          <div style={{ maxWidth: '45%', textAlign: 'right' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>Payment Info</div>
            <div>
              {store.paymentDetails.bankName && <div>{store.paymentDetails.bankName}</div>}
              {store.paymentDetails.accountName && <div>{store.paymentDetails.accountName}</div>}
              {store.paymentDetails.accountNumber && <div>Acc: {store.paymentDetails.accountNumber}</div>}
              {store.paymentDetails.ifscCode && <div>IFSC: {store.paymentDetails.ifscCode}</div>}
              {store.paymentDetails.swiftCode && <div>SWIFT: {store.paymentDetails.swiftCode}</div>}
              {store.paymentDetails.routingCode && <div>Routing: {store.paymentDetails.routingCode}</div>}
              {store.paymentDetails.bankAddress && <div>{store.paymentDetails.bankAddress}</div>}
              {store.paymentDetails.bankNotes && <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{store.paymentDetails.bankNotes}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
