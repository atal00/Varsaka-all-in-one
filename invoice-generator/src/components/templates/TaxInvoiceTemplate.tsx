import React from 'react';
import { InvoiceState } from '@/store/invoiceStore';
import { numberToWords } from '@/lib/numberToWords';

export const TaxInvoiceTemplate = ({ store }: { store: InvoiceState }) => {
  const { calculations } = store;
  const themeColor = store.themeColor || '#1e293b';

  return (
    <div style={{ padding: '3.5rem', fontFamily: store.fontFamily || 'var(--font-inter)', color: '#0f172a', fontSize: '0.85rem' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '60%' }}>
          {store.sender.logoUrl && (
            <img src={store.sender.logoUrl} alt="Logo" style={{ maxHeight: '100px', marginBottom: '1rem', objectFit: 'contain' }} />
          )}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 400, color: '#000', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Tax Invoice
          </h1>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '1.5rem' }}>
            # {store.invoicePrefix}{store.invoiceNumber}
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
             <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Balance Due</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{store.currency}{(calculations.total).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Bill To & Dates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '50%' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{store.client.name || 'Client Name'}</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
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
          {store.client.email && <div>{store.client.email}</div>}
          {store.client.taxId && <div>GSTIN / Tax ID: {store.client.taxId}</div>}
        </div>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ color: '#64748b', textAlign: 'right' }}>Invoice Date :</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{store.issueDate}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ color: '#64748b', textAlign: 'right' }}>Due Date :</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{store.dueDate}</div>
          </div>
          {store.poCode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ color: '#64748b', textAlign: 'right' }}>PO Code :</div>
              <div style={{ textAlign: 'right', fontWeight: 500 }}>{store.poCode}</div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: themeColor, color: '#fff' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', width: '5%', fontWeight: 600 }}>#</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', fontWeight: 600 }}>Item & Description</th>
            <th style={{ textAlign: 'center', padding: '0.5rem 1rem', width: '10%', fontWeight: 600 }}>HSN/SAC</th>
            <th style={{ textAlign: 'right', padding: '0.5rem 1rem', width: '10%', fontWeight: 600 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '0.5rem 1rem', width: '15%', fontWeight: 600 }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '0.5rem 1rem', width: '15%', fontWeight: 600 }}>IGST</th>
            <th style={{ textAlign: 'right', padding: '0.5rem 1rem', width: '15%', fontWeight: 600 }}>Amount</th>
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
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>{i + 1}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{item.name || 'Item Description'}</div>
                  {item.description && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{item.description}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '1rem', verticalAlign: 'top' }}>{item.hsnCode || '-'}</td>
                <td style={{ textAlign: 'right', padding: '1rem', verticalAlign: 'top' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', padding: '1rem', verticalAlign: 'top' }}>{item.rate.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '1rem', verticalAlign: 'top' }}>
                  {item.taxRate ? (
                    <>
                      <div>{taxAmount.toFixed(2)}</div>
                      <div style={{ fontSize: '0.8em', color: '#64748b' }}>{item.taxRate}%</div>
                    </>
                  ) : '-'}
                </td>
                <td style={{ textAlign: 'right', padding: '1rem', verticalAlign: 'top' }}>{amountIncludingTax.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #e2e8f0' }}>
            <td colSpan={5} style={{ textAlign: 'right', padding: '0.5rem 1rem', fontWeight: 600 }}>Sub Total</td>
            <td style={{ textAlign: 'right', padding: '0.5rem 1rem' }}>{calculations.totalItemTax.toFixed(2)}</td>
            <td style={{ textAlign: 'right', padding: '0.5rem 1rem' }}>{(calculations.subtotal + calculations.totalItemTax).toFixed(2)}</td>
          </tr>
          {calculations.discountAmount > 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'right', padding: '0.5rem 1rem', color: '#ef4444' }}>Discount ({store.discountType === 'percentage' ? `${store.discountValue}%` : 'Fixed'})</td>
              <td style={{ textAlign: 'right', padding: '0.5rem 1rem', color: '#ef4444' }}>(-) {calculations.discountAmount.toFixed(2)}</td>
            </tr>
          )}
          {calculations.taxAmount1 > 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'right', padding: '0.5rem 1rem', color: '#ef4444' }}>Amount Withheld (TDS)</td>
              <td style={{ textAlign: 'right', padding: '0.5rem 1rem', color: '#ef4444' }}>(-) {calculations.taxAmount1.toFixed(2)}</td>
            </tr>
          )}
          <tr style={{ fontSize: '1.1rem' }}>
            <td colSpan={6} style={{ textAlign: 'right', padding: '1rem 1rem 0.5rem 1rem', fontWeight: 700 }}>Total</td>
            <td style={{ textAlign: 'right', padding: '1rem 1rem 0.5rem 1rem', fontWeight: 700 }}>{store.currency}{calculations.total.toFixed(2)}</td>
          </tr>
          <tr style={{ backgroundColor: '#f1f5f9', fontSize: '1.1rem' }}>
            <td colSpan={6} style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700 }}>Balance Due</td>
            <td style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700 }}>{store.currency}{calculations.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
         <div style={{ textAlign: 'right' }}>
           <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.5rem' }}>Total in Words:</span>
           <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{numberToWords(calculations.total, store.currency)}</span>
         </div>
      </div>

      {/* Footer / Notes / Bank */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          {store.notes && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Notes</div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{store.notes}</div>
            </div>
          )}
          
          {(store.dispatchDetails.vehicleNo || store.dispatchDetails.ewayBill || store.dispatchDetails.destination) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Dispatch Details</div>
              <div style={{ fontSize: '0.8rem' }}>
                {store.dispatchDetails.vehicleNo && <div>Vehicle No: {store.dispatchDetails.vehicleNo}</div>}
                {store.dispatchDetails.ewayBill && <div>E-Way Bill: {store.dispatchDetails.ewayBill}</div>}
                {store.dispatchDetails.destination && <div>Destination: {store.dispatchDetails.destination}</div>}
              </div>
            </div>
          )}
          
          {store.isReverseCharge && (
            <div style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.8rem' }}>
              * Reverse Charge is applicable on this invoice.
            </div>
          )}
        </div>

        {store.paymentDetails && (store.paymentDetails.bankName || store.paymentDetails.accountNumber) && (
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Bank Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', fontSize: '0.8rem' }}>
              {store.paymentDetails.bankName && <><div>Bank:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.bankName}</div></>}
              {store.paymentDetails.accountName && <><div>Account Name:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.accountName}</div></>}
              {store.paymentDetails.accountNumber && <><div>Account No:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.accountNumber}</div></>}
              {store.paymentDetails.ifscCode && <><div>IFSC Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.ifscCode}</div></>}
              {store.paymentDetails.swiftCode && <><div>SWIFT Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.swiftCode}</div></>}
              {store.paymentDetails.routingCode && <><div>Routing Code:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.routingCode}</div></>}
              {store.paymentDetails.bankAddress && <><div>Bank Address:</div><div style={{ fontWeight: 600 }}>{store.paymentDetails.bankAddress}</div></>}
            </div>
            {store.paymentDetails.bankNotes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {store.paymentDetails.bankNotes}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
