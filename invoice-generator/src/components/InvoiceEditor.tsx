'use client';

import React from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useItemStore } from '../store/itemStore';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import styles from './ui/ui.module.css';
import { Plus, Trash2 } from 'lucide-react';
import { ClientManager } from './ClientManager';

export const InvoiceEditor = () => {
  const store = useInvoiceStore();
  const itemStore = useItemStore();

  return (
    <div className={styles.flexCol} style={{ gap: '1.5rem' }}>
      
      <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Project & Client Management</h2>
        
        <div className={styles.flexCol} style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Client Profile</h3>
          <ClientManager />
        </div>
        <div className={styles.grid2} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
            <Input 
              label="Prefix" 
              value={store.invoicePrefix} 
              onChange={e => store.setInvoiceDetails({ invoicePrefix: e.target.value })} 
            />
            <Input 
              label="Invoice Number" 
              value={store.invoiceNumber} 
              onChange={e => store.setInvoiceDetails({ invoiceNumber: e.target.value })} 
            />
          </div>
          <Input 
            label="PO / Project Code" 
            value={store.poCode} 
            onChange={e => store.setInvoiceDetails({ poCode: e.target.value })} 
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.label}>Invoice Currency</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className={styles.glassInput} 
                  value={['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'].includes(store.currency) ? store.currency : 'CUSTOM'} 
                  onChange={async (e) => {
                    const newCurrency = e.target.value;
                    if (newCurrency === 'CUSTOM') {
                      store.setInvoiceDetails({ currency: '' });
                      return;
                    }
                    store.setInvoiceDetails({ currency: newCurrency });
                    if (newCurrency === store.baseCurrency) {
                      store.setInvoiceDetails({ exchangeRate: 1 });
                    } else {
                      try {
                        const res = await fetch(`https://open.er-api.com/v6/latest/${newCurrency}`);
                        const data = await res.json();
                        if (data && data.rates && data.rates[store.baseCurrency]) {
                          store.setInvoiceDetails({ exchangeRate: data.rates[store.baseCurrency] });
                        }
                      } catch (err) {
                        console.error("Exchange rate fetch error", err);
                      }
                    }
                  }}
                  style={{ flex: !['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'].includes(store.currency) ? '0 0 auto' : '1', width: !['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'].includes(store.currency) ? '90px' : '100%' }}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="CUSTOM">Custom...</option>
                </select>
                {!['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'].includes(store.currency) && (
                  <input
                    className={styles.glassInput}
                    value={store.currency}
                    onChange={(e) => store.setInvoiceDetails({ currency: e.target.value })}
                    placeholder="e.g. ₹ or Kr"
                    style={{ flex: '1' }}
                  />
                )}
              </div>
              {store.currency !== store.baseCurrency && store.exchangeRate && ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'].includes(store.currency) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.4rem', fontWeight: 600 }}>
                  1 {store.currency} = {store.exchangeRate.toFixed(4)} {store.baseCurrency} (Live)
                </div>
              )}
            </div>
          </div>
          <Input 
            type="date" 
            label="Issue Date" 
            value={store.issueDate} 
            onChange={e => store.setInvoiceDetails({ issueDate: e.target.value })} 
          />
          <Input 
            type="date" 
            label="Due Date" 
            value={store.dueDate} 
            onChange={e => store.setInvoiceDetails({ dueDate: e.target.value })} 
          />
        </div>
      </Card>

      <Card className="animate-in" style={{ animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Line Items Module</h2>
          <Button onClick={() => store.addLineItem()}><Plus size={16} /> Add Item</Button>
        </div>
        
        <div className={styles.flexCol}>
          {store.lineItems.map((item, index) => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 1fr 0.8fr 0.8fr auto', gap: '0.75rem', alignItems: 'end', background: '#f9fafb', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>{index === 0 ? "Description (Select or Type)" : ""}</label>
                <input 
                  list={`saved-items-${item.id}`}
                  className={styles.glassInput}
                  value={item.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    store.updateLineItem(item.id, { name: val });
                    const saved = itemStore.items.find(i => i.name === val);
                    if (saved) {
                      store.updateLineItem(item.id, { description: saved.description, rate: saved.rate, unit: saved.unit });
                    }
                  }}
                  placeholder="Item name"
                />
                <datalist id={`saved-items-${item.id}`}>
                  {itemStore.items.map(saved => (
                    <option key={saved.id} value={saved.name} />
                  ))}
                </datalist>
              </div>

              <Input 
                label={index === 0 ? "HSN/SAC" : ""} 
                value={item.hsnCode || ''} 
                onChange={e => store.updateLineItem(item.id, { hsnCode: e.target.value })} 
                placeholder="Code"
              />
              <Input 
                type="number" 
                label={index === 0 ? "Qty" : ""} 
                value={item.quantity} 
                onChange={e => store.updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} 
              />
              <Input 
                type="number" 
                label={index === 0 ? "Rate" : ""} 
                value={item.rate} 
                onChange={e => store.updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })} 
              />
              <Input 
                label={index === 0 ? "Unit" : ""} 
                value={item.unit} 
                onChange={e => store.updateLineItem(item.id, { unit: e.target.value })} 
                placeholder="hrs, unit, etc."
              />
              <Input 
                type="number" 
                label={index === 0 ? "Tax %" : ""} 
                value={item.taxRate || ''} 
                onChange={e => store.updateLineItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })} 
                placeholder="e.g. 18"
              />
              
              <Button variant="danger" style={{ marginBottom: '0.1rem' }} onClick={() => store.removeLineItem(item.id)} disabled={store.lineItems.length === 1}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="animate-in" style={{ animationDelay: '0.3s' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Advanced Settings Module</h2>
        <div className={styles.grid2}>
          <div className={styles.flexRow}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Discount Type</label>
              <select 
                className={styles.glassInput} 
                value={store.discountType} 
                onChange={e => store.setInvoiceDetails({ discountType: e.target.value as 'percentage' | 'fixed' })}
              >
                <option value="percentage">Percent (%)</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <Input 
              style={{ flex: 1 }}
              type="number" 
              label="Discount Value" 
              value={store.discountValue} 
              onChange={e => store.setInvoiceDetails({ discountValue: parseFloat(e.target.value) || 0 })} 
            />
          </div>
          
          <div className={styles.flexRow}>
            <Input 
              style={{ flex: 1 }}
              type="number" 
              label="TDS (%)" 
              value={store.taxRate1} 
              onChange={e => store.setInvoiceDetails({ taxRate1: parseFloat(e.target.value) || 0 })} 
            />
            <div style={{ flex: 1 }}></div>
          </div>
        </div>
        
        <div style={{ marginTop: '1.25rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes / Terms & Conditions</label>
            <textarea 
              className={styles.glassInput} 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={store.notes} 
              onChange={e => store.setInvoiceDetails({ notes: e.target.value })} 
              placeholder="Enter thank you messages, payment terms, etc."
            />
          </div>
        </div>


      </Card>
    </div>
  );
};
