'use client';

import React, { useState } from 'react';
import { useClientStore } from '@/store/clientStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Search, Plus, Trash2, Edit2, X, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'other'|'address'|'contact'|'remarks'>('other');

  // Huge form state matching all new DB fields
  const [formData, setFormData] = useState<any>({
    customerType: 'business',
    salutation: '',
    firstName: '',
    lastName: '',
    companyName: '',
    name: '', // Display Name
    email: '',
    workPhone: '',
    mobilePhone: '',
    
    // Other Details
    gstTreatment: '',
    placeOfSupply: '',
    pan: '',
    taxPreference: 'taxable',
    currency: 'INR',
    openingBalance: '',
    paymentTerms: '',
    taxId: '',

    // Billing
    billingAttention: '',
    billingCountry: '',
    billingStreet1: '',
    billingStreet2: '',
    billingCity: '',
    billingState: '',
    billingPinCode: '',
    billingPhone: '',

    // Shipping
    shippingAttention: '',
    shippingCountry: '',
    shippingStreet1: '',
    shippingStreet2: '',
    shippingCity: '',
    shippingState: '',
    shippingPinCode: '',
    shippingPhone: '',

    contactPersons: '[]',
    remarks: '',
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (client?: any) => {
    if (client) {
      setEditingClient(client);
      setFormData({ 
        ...client,
        contactPersons: client.contactPersons || '[]'
      });
    } else {
      setEditingClient(null);
      setFormData({
        customerType: 'business', salutation: '', firstName: '', lastName: '', companyName: '', name: '', email: '', workPhone: '', mobilePhone: '',
        gstTreatment: '', placeOfSupply: '', pan: '', taxPreference: 'taxable', currency: 'INR', openingBalance: '', paymentTerms: '', taxId: '',
        billingAttention: '', billingCountry: '', billingStreet1: '', billingStreet2: '', billingCity: '', billingState: '', billingPinCode: '', billingPhone: '',
        shippingAttention: '', shippingCountry: '', shippingStreet1: '', shippingStreet2: '', shippingCity: '', shippingState: '', shippingPinCode: '', shippingPhone: '',
        contactPersons: '[]', remarks: '',
      });
    }
    setActiveTab('other');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Display Name is required');
      return;
    }
    
    if (editingClient) {
      updateClient(editingClient.id, formData);
      toast.success('Customer updated successfully');
    } else {
      addClient(formData);
      toast.success('Customer added successfully');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteClient(id);
      toast.success('Customer deleted');
    }
  };

  const copyBillingToShipping = () => {
    setFormData((prev: any) => ({
      ...prev,
      shippingAttention: prev.billingAttention,
      shippingCountry: prev.billingCountry,
      shippingStreet1: prev.billingStreet1,
      shippingStreet2: prev.billingStreet2,
      shippingCity: prev.billingCity,
      shippingState: prev.billingState,
      shippingPinCode: prev.billingPinCode,
      shippingPhone: prev.billingPhone,
    }));
    toast.success('Billing address copied to shipping');
  };

  // Contacts JSON management
  const contacts = JSON.parse(formData.contactPersons || '[]');
  const addContact = () => {
    const newContacts = [...contacts, { salutation: '', firstName: '', lastName: '', email: '', workPhone: '', mobilePhone: '' }];
    setFormData({ ...formData, contactPersons: JSON.stringify(newContacts) });
  };
  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, contactPersons: JSON.stringify(newContacts) });
  };
  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, contactPersons: JSON.stringify(newContacts) });
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Customers</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your address book and comprehensive client details.</p>
        </div>
        <Button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Customer
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', width: '350px', marginBottom: '2rem' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
        <input 
          type="text" 
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', width: '100%' }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredClients.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No customers found. Try adding one!
          </div>
        ) : (
          filteredClients.map(client => (
            <Card key={client.id} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openModal(client)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(client.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {client.companyName && <div><strong style={{ color: 'var(--text-primary)' }}>Company:</strong> {client.companyName}</div>}
                {client.email && <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {client.email}</div>}
                {client.taxId && <div><strong style={{ color: 'var(--text-primary)' }}>GSTIN / Tax ID:</strong> {client.taxId}</div>}
              </div>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          padding: '2rem', overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '0.75rem', width: '100%', maxWidth: '900px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {editingClient ? 'Edit Customer' : 'New Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>

            {/* Core Details (Always visible at top) */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Customer Type</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="customerType" value="business" checked={formData.customerType === 'business'} onChange={() => setFormData({...formData, customerType: 'business'})} /> Business
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="customerType" value="individual" checked={formData.customerType === 'individual'} onChange={() => setFormData({...formData, customerType: 'individual'})} /> Individual
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Primary Contact</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '0.5rem' }}>
                  <select style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} value={formData.salutation} onChange={e => setFormData({...formData, salutation: e.target.value})}>
                    <option value="">Salutation</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                  <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First Name" />
                  <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Last Name" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Company Name</label>
                <Input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 500 }}>Display Name *</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input value={formData.workPhone} onChange={e => setFormData({...formData, workPhone: e.target.value})} placeholder="Work Phone" />
                  <Input value={formData.mobilePhone} onChange={e => setFormData({...formData, mobilePhone: e.target.value})} placeholder="Mobile" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '2rem', padding: '0 2rem' }}>
              {[
                { id: 'other', label: 'Other Details' },
                { id: 'address', label: 'Address' },
                { id: 'contact', label: 'Contact Persons' },
                { id: 'remarks', label: 'Remarks' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '1rem 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '2rem', minHeight: '350px', background: '#f8fafc' }}>
              
              {activeTab === 'other' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#dc2626' }}>GST Treatment *</label>
                    <select style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} value={formData.gstTreatment} onChange={e => setFormData({...formData, gstTreatment: e.target.value})}>
                      <option value="">Select a GST treatment</option>
                      <option value="Registered Business - Regular">Registered Business - Regular</option>
                      <option value="Registered Business - Composition">Registered Business - Composition</option>
                      <option value="Unregistered Business">Unregistered Business</option>
                      <option value="Consumer">Consumer</option>
                      <option value="Overseas">Overseas</option>
                      <option value="Special Economic Zone">Special Economic Zone</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>GSTIN / Tax ID</label>
                    <Input value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Place of Supply</label>
                    <Input value={formData.placeOfSupply} onChange={e => setFormData({...formData, placeOfSupply: e.target.value})} placeholder="e.g. MH-Maharashtra" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>PAN</label>
                    <Input value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: '#dc2626' }}>Tax Preference *</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="taxPref" value="taxable" checked={formData.taxPreference === 'taxable'} onChange={() => setFormData({...formData, taxPreference: 'taxable'})} /> Taxable
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name="taxPref" value="exempt" checked={formData.taxPreference === 'exempt'} onChange={() => setFormData({...formData, taxPreference: 'exempt'})} /> Tax Exempt
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Currency</label>
                    <select style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Payment Terms</label>
                    <select style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}>
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  {/* Billing Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Billing Address</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Attention</label>
                      <Input value={formData.billingAttention} onChange={e => setFormData({...formData, billingAttention: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Country</label>
                      <Input value={formData.billingCountry} onChange={e => setFormData({...formData, billingCountry: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'flex-start' }}>
                      <label style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Address</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Input value={formData.billingStreet1} onChange={e => setFormData({...formData, billingStreet1: e.target.value})} placeholder="Street 1" />
                        <Input value={formData.billingStreet2} onChange={e => setFormData({...formData, billingStreet2: e.target.value})} placeholder="Street 2" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>City</label>
                      <Input value={formData.billingCity} onChange={e => setFormData({...formData, billingCity: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>State</label>
                      <Input value={formData.billingState} onChange={e => setFormData({...formData, billingState: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Pin Code</label>
                      <Input value={formData.billingPinCode} onChange={e => setFormData({...formData, billingPinCode: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Phone</label>
                      <Input value={formData.billingPhone} onChange={e => setFormData({...formData, billingPhone: e.target.value})} />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Shipping Address</h3>
                      <button onClick={copyBillingToShipping} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ↓ Copy billing address
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Attention</label>
                      <Input value={formData.shippingAttention} onChange={e => setFormData({...formData, shippingAttention: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Country</label>
                      <Input value={formData.shippingCountry} onChange={e => setFormData({...formData, shippingCountry: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'flex-start' }}>
                      <label style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Address</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Input value={formData.shippingStreet1} onChange={e => setFormData({...formData, shippingStreet1: e.target.value})} placeholder="Street 1" />
                        <Input value={formData.shippingStreet2} onChange={e => setFormData({...formData, shippingStreet2: e.target.value})} placeholder="Street 2" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>City</label>
                      <Input value={formData.shippingCity} onChange={e => setFormData({...formData, shippingCity: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>State</label>
                      <Input value={formData.shippingState} onChange={e => setFormData({...formData, shippingState: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Pin Code</label>
                      <Input value={formData.shippingPinCode} onChange={e => setFormData({...formData, shippingPinCode: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem' }}>Phone</label>
                      <Input value={formData.shippingPhone} onChange={e => setFormData({...formData, shippingPhone: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem' }}>SALUTATION</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>FIRST NAME</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>LAST NAME</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>EMAIL ADDRESS</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>WORK PHONE</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>MOBILE</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact: any, index: number) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '0.5rem' }}>
                              <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.salutation} onChange={e => updateContact(index, 'salutation', e.target.value)}>
                                <option value=""></option>
                                <option value="Mr.">Mr.</option>
                                <option value="Mrs.">Mrs.</option>
                                <option value="Ms.">Ms.</option>
                                <option value="Dr.">Dr.</option>
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem' }}><input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.firstName} onChange={e => updateContact(index, 'firstName', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem' }}><input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.lastName} onChange={e => updateContact(index, 'lastName', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem' }}><input type="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.email} onChange={e => updateContact(index, 'email', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem' }}><input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.workPhone} onChange={e => updateContact(index, 'workPhone', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem' }}><input style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '4px' }} value={contact.mobilePhone} onChange={e => updateContact(index, 'mobilePhone', e.target.value)} /></td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button onClick={() => removeContact(index)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="secondary" onClick={addContact} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                    <Plus size={16} /> Add Contact Person
                  </Button>
                </div>
              )}

              {activeTab === 'remarks' && (
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Remarks (For Internal Use)</label>
                  <textarea 
                    style={{ width: '100%', minHeight: '150px', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontFamily: 'inherit', fontSize: '0.95rem' }}
                    value={formData.remarks}
                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#fff' }}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingClient ? 'Save Changes' : 'Save Customer'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
