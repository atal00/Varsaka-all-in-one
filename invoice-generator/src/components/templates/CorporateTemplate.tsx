import React from 'react';
import { InvoiceState } from '@/store/invoiceStore';
import { numberToWords } from '@/lib/numberToWords';

export const CorporateTemplate = ({ store }: { store: InvoiceState }) => {
  const { calculations } = store;
  const themeColor = store.themeColor || '#2563eb';

  return (
    <div style={{ padding: '3rem 3.5rem', fontFamily: store.fontFamily || 'var(--font-inter)', color: '#0f172a', fontSize: '0.85rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ color: themeColor, fontWeight: 700, fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {store.currency} INVOICE
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            {store.sender.name || 'Your Company Name'}
          </h2>
          <div style={{ lineHeight: 1.4, color: '#334155' }}>
            {store.sender.address && <div style={{ whiteSpace: 'pre-wrap' }}>{store.sender.address}</div>}
            {store.sender.phone && <div>Mobile: {store.sender.phone}</div>}
            {store.sender.email && <div>Email: {store.sender.email}</div>}
            {store.sender.taxId && <div>GSTIN / Tax ID: {store.sender.taxId}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#475569' }}>
            Original For Recipient
          </div>
          {store.sender.logoUrl && (
            <img src={store.sender.logoUrl} alt="Logo" style={{ maxHeight: '80px', objectFit: 'contain', float: 'right' }} />
          )}
        </div>
      </div>

      {/* Meta Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        <div>Invoice #: {store.invoicePrefix}{store.invoiceNumber}</div>
        <div>Invoice Date: {store.issueDate}</div>
        <div>Due Date: {store.dueDate}</div>
      </div>

      {/* Addresses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Customer Details:</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{store.client.name || 'Client Name'}</div>
          {store.client.email && <div>{store.client.email}</div>}
          {store.client.taxId && <div>GSTIN / Tax ID: {store.client.taxId}</div>}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Billing Address:</div>
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
        </div>
      </div>

      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Currency: {store.currency}</div>

      {/* Line Items */}
      {(() => {
        const hasTaxes = store.lineItems.some(i => i.taxRate && i.taxRate > 0);
        const colSpanSubTotal = hasTaxes ? 4 : 3;
        const colSpanTotals = hasTaxes ? 5 : 4;

        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0', width: '5%' }}>#</th>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0', width: '20%' }}>Rate / Item</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0', width: '10%' }}>Qty</th>
                {hasTaxes && (
                  <th style={{ textAlign: 'right', padding: '0.5rem 0', width: '15%' }}>IGST</th>
                )}
                <th style={{ textAlign: 'right', padding: '0.5rem 0', width: '20%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {store.lineItems.map((item, i) => {
                const itemTotal = item.quantity * item.rate;
                const discountRatio = calculations.subtotal > 0 ? calculations.discountAmount / calculations.subtotal : 0;
                const effectiveTotal = itemTotal * (1 - discountRatio);
                const taxAmount = effectiveTotal * ((item.taxRate || 0) / 100);
                const amountIncludingTax = itemTotal + taxAmount;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 0', verticalAlign: 'top' }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <div style={{ fontWeight: 600 }}>{item.name || 'Item Description'}</div>
                      {item.description && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#475569' }}>{item.description}</div>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0', verticalAlign: 'top' }}>{item.rate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '0.75rem 0', verticalAlign: 'top' }}>{item.quantity}</td>
                    {hasTaxes && (
                      <td style={{ textAlign: 'right', padding: '0.75rem 0', verticalAlign: 'top' }}>
                        {item.taxRate ? (
                          <>
                            <div>{taxAmount.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8em', color: '#64748b' }}>{item.taxRate}%</div>
                          </>
                        ) : '-'}
                      </td>
                    )}
                    <td style={{ textAlign: 'right', padding: '0.75rem 0', verticalAlign: 'top' }}>{(amountIncludingTax).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={colSpanSubTotal} style={{ textAlign: 'right', padding: '1rem 0 0.5rem 0', fontWeight: 600, fontSize: '0.875rem' }}>Subtotal</td>
                {hasTaxes && (
                  <td style={{ textAlign: 'right', padding: '1rem 0 0.5rem 0', fontSize: '0.875rem' }}>{calculations.totalItemTax.toFixed(2)}</td>
                )}
                <td style={{ textAlign: 'right', padding: '1rem 0 0.5rem 0', fontWeight: 600, fontSize: '0.875rem' }}>{(calculations.subtotal + calculations.totalItemTax).toFixed(2)}</td>
              </tr>
              {calculations.discountAmount > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                    Discount ({store.discountType === 'percentage' ? `${store.discountValue}%` : 'Fixed'})
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>-{store.currency}{calculations.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              {calculations.taxAmount1 > 0 && (
                <tr>
                  <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                    TDS ({store.taxRate1}%)
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>-{store.currency}{calculations.taxAmount1.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={colSpanTotals} style={{ textAlign: 'right', padding: '1rem 0', fontSize: '1.25rem', fontWeight: 700, borderTop: '2px solid #000', borderBottom: `2px solid ${themeColor}` }}>
                  Amount Payable
                </td>
                <td style={{ textAlign: 'right', padding: '1rem 0', fontSize: '1.25rem', fontWeight: 700, borderTop: '2px solid #000', borderBottom: `2px solid ${themeColor}` }}>
                  {store.currency}{calculations.total.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={colSpanTotals + 1} style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Total amount (in words): {numberToWords(calculations.total, store.currency)}
                </td>
              </tr>
              <tr>
                <td colSpan={colSpanTotals + 1} style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Total Items / Qty : {store.lineItems.length} / {store.lineItems.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        );
      })()}

      {/* Bank & Signature */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginTop: '3rem' }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', textDecoration: 'underline' }}>Bank Details:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', fontSize: '0.8rem' }}>
            {store.paymentDetails?.bankName && <>
              <div>Bank:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.bankName}</div>
            </>}
            {store.paymentDetails?.accountName && <>
              <div>Account Holder:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.accountName}</div>
            </>}
            {store.paymentDetails?.accountNumber && <>
              <div>Account #:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.accountNumber}</div>
            </>}
            {store.paymentDetails?.ifscCode && <>
              <div>IFSC Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.ifscCode}</div>
            </>}
            {store.paymentDetails?.swiftCode && <>
              <div>SWIFT Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.swiftCode}</div>
            </>}
            {store.paymentDetails?.routingCode && <>
              <div>Routing Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.routingCode}</div>
            </>}
            {store.paymentDetails?.bankAddress && <>
              <div>Bank Address:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.bankAddress}</div>
            </>}
          </div>
          {store.paymentDetails?.bankNotes && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {store.paymentDetails.bankNotes}
            </div>
          )}
          {store.notes && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Notes:</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{store.notes}</div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', marginBottom: '3rem' }}>For {store.sender.name || 'Your Company'}</div>
          <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
};
