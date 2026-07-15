import React, { useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { useClientStore } from '../store/clientStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Search, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './ui/ui.module.css';

export const ClientManager = () => {
  const invoiceStore = useInvoiceStore();
  const clientStore = useClientStore();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', taxId: '' });

  const filteredClients = clientStore.clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClient = (client: any) => {
    invoiceStore.setClient(client);
    setIsSearching(false);
    setSearchTerm('');
  };

  const handleSaveNewClient = () => {
    if (!formData.name) {
      toast.error('Client name is required');
      return;
    }
    clientStore.addClient(formData);
    // fallback if addClient doesn't return the full object
    const added = clientStore.clients.find(c => c.name === formData.name);
    if (added) invoiceStore.setClient(added);
    toast.success('Client added and selected');
    setIsModalOpen(false);
    setFormData({ name: '', email: '', address: '', taxId: '' });
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {!isSearching && invoiceStore.client.name ? (
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{invoiceStore.client.name}</h3>
            <button onClick={() => setIsSearching(true)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              Change Client
            </button>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {invoiceStore.client.email && <div>{invoiceStore.client.email}</div>}
            {invoiceStore.client.taxId && <div>GSTIN: {invoiceStore.client.taxId}</div>}
            {invoiceStore.client.address && <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>{invoiceStore.client.address}</div>}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', width: '100%' }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search for a client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearching(true)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', width: '100%' }} 
            />
            {isSearching && invoiceStore.client.name && (
              <button onClick={() => setIsSearching(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {isSearching && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '250px', overflowY: 'auto' }}>
              {filteredClients.length > 0 ? (
                <div>
                  {filteredClients.map(client => (
                    <div 
                      key={client.id} 
                      onClick={() => handleSelectClient(client)}
                      style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{client.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || 'No email'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No clients found matching "{searchTerm}"
                </div>
              )}
              
              <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-light)', background: '#f8fafc' }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Add New Client
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '500px',
            padding: '2rem', position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New Client</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <Input label="GSTIN / Tax ID" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className={styles.label}>Address</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={styles.glassInput}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <Button onClick={handleSaveNewClient} style={{ marginTop: '1rem' }}>
                Save & Select Client
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
