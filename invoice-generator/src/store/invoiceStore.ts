import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import { LineItem, DiscountType, CalculationResult, calculateInvoice } from '../lib/calculations';

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

export interface SenderDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  logoUrl?: string;
}

export interface ClientDetails {
  id: string;
  name: string; // Used as Display Name
  email: string;
  address: string; // Kept for backwards compatibility
  taxId?: string; // Kept for backwards compatibility

  customerType?: string; // 'business' | 'individual'
  salutation?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  workPhone?: string;
  mobilePhone?: string;

  gstTreatment?: string;
  placeOfSupply?: string;
  pan?: string;
  taxPreference?: string;
  currency?: string;
  openingBalance?: string;
  paymentTerms?: string;

  billingAttention?: string;
  billingCountry?: string;
  billingStreet1?: string;
  billingStreet2?: string;
  billingCity?: string;
  billingState?: string;
  billingPinCode?: string;
  billingPhone?: string;

  shippingAttention?: string;
  shippingCountry?: string;
  shippingStreet1?: string;
  shippingStreet2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPinCode?: string;
  shippingPhone?: string;

  contactPersons?: string; // JSON string for contacts
  remarks?: string;
}

export interface DispatchDetails {
  vehicleNo: string;
  ewayBill: string;
  destination: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingCode: string; // Keeping for backward compatibility or general routing
  ifscCode: string;
  swiftCode: string;
  bankAddress: string;
  bankNotes: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface InvoiceState {
  id: string;
  invoicePrefix: string;
  invoiceNumber: string;
  poCode: string; // new
  issueDate: string;
  dueDate: string;
  template: string; // new
  sender: SenderDetails;
  client: ClientDetails;
  dispatchDetails: DispatchDetails;
  isReverseCharge: boolean;
  lineItems: LineItem[];
  discountType: DiscountType;
  discountValue: number;
  taxRate1: number;
  taxRate2: number;
  currency: string;
  baseCurrency: string;
  exchangeRate: number;
  notes: string;
  terms: string;
  paymentDetails: PaymentDetails;
  themeColor: string;
  fontFamily: string;
  
  calculations: CalculationResult;
  savedInvoices: any[];

  setSender: (sender: Partial<SenderDetails>) => void;
  setClient: (client: Partial<ClientDetails>) => void;
  setInvoiceDetails: (details: Partial<Omit<InvoiceState, 'sender' | 'client' | 'lineItems' | 'calculations' | 'savedInvoices' | 'setSender' | 'setClient' | 'setInvoiceDetails' | 'addLineItem' | 'updateLineItem' | 'removeLineItem' | 'saveInvoice' | 'deleteInvoice' | 'loadInvoice' | 'recalculate'>>) => void;
  
  addLineItem: (item?: Partial<LineItem>) => void;
  updateLineItem: (id: string, updates: Partial<LineItem>) => void;
  removeLineItem: (id: string) => void;
  
  saveInvoice: () => void;
  deleteInvoice: (id: string) => void;
  loadInvoice: (id: string) => void;
  createNewInvoice: (profile: any) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;

  recalculate: () => void;
}

const initialSender: SenderDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const initialClient: ClientDetails = {
  id: '',
  name: '',
  email: '',
  address: '',
};

const initialPaymentDetails: PaymentDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingCode: '',
  ifscCode: '',
  swiftCode: '',
  bankAddress: '',
  bankNotes: '',
};

const initialDispatchDetails: DispatchDetails = {
  vehicleNo: '',
  ewayBill: '',
  destination: '',
};

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      id: generateId(),
      invoicePrefix: 'INV-',
      invoiceNumber: '001',
      poCode: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      template: 'standard',
      sender: initialSender,
      client: initialClient,
      dispatchDetails: initialDispatchDetails,
      isReverseCharge: false,
      lineItems: [{ id: generateId(), name: '', description: '', quantity: 1, rate: 0, unit: 'hrs', hsnCode: '', taxRate: 0 }],
      discountType: 'percentage',
      discountValue: 0,
      taxRate1: 0,
      taxRate2: 0,
      currency: 'USD',
      baseCurrency: 'INR',
      exchangeRate: 83.5,
      notes: 'Thank you for your business!',
      terms: 'Please pay within 7 days.',
      paymentDetails: initialPaymentDetails,
      themeColor: '#1d4ed8', // Default blue
      fontFamily: 'var(--font-inter)', // Default font
      
      calculations: { subtotal: 0, discountAmount: 0, subtotalAfterDiscount: 0, taxAmount1: 0, taxAmount2: 0, totalItemTax: 0, totalTax: 0, total: 0 },
      savedInvoices: [],

      setSender: (senderUpdates) => set((state) => ({ sender: { ...state.sender, ...senderUpdates } })),
      setClient: (clientUpdates) => set((state) => ({ client: { ...state.client, ...clientUpdates } })),
      setInvoiceDetails: (details) => {
        set((state) => ({ ...state, ...details }));
        get().recalculate();
      },
      
      addLineItem: (item) => {
        set((state) => ({
          lineItems: [...state.lineItems, { id: generateId(), name: '', description: '', quantity: 1, rate: 0, unit: 'hrs', hsnCode: '', taxRate: 0, ...item }]
        }));
        get().recalculate();
      },
      
      updateLineItem: (id, updates) => {
        set((state) => ({
          lineItems: state.lineItems.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
        get().recalculate();
      },
      
      removeLineItem: (id) => {
        set((state) => ({
          lineItems: state.lineItems.filter(item => item.id !== id)
        }));
        get().recalculate();
      },

      recalculate: () => {
        const state = get();
        const calculations = calculateInvoice({
          lineItems: state.lineItems,
          discountType: state.discountType,
          discountValue: state.discountValue,
          taxRate1: state.taxRate1,
          taxRate2: state.taxRate2,
        });
        set({ calculations });
      },

      saveInvoice: () => {
        const state = get();
        const snapshot = {
          id: state.id,
          invoicePrefix: state.invoicePrefix,
          invoiceNumber: state.invoiceNumber,
          poCode: state.poCode,
          issueDate: state.issueDate,
          dueDate: state.dueDate,
          template: state.template,
          sender: { ...state.sender },
          client: { ...state.client },
          dispatchDetails: { ...state.dispatchDetails },
          isReverseCharge: state.isReverseCharge,
          lineItems: [...state.lineItems],
          discountType: state.discountType,
          discountValue: state.discountValue,
          taxRate1: state.taxRate1,
          taxRate2: state.taxRate2,
          currency: state.currency,
          baseCurrency: state.baseCurrency,
          exchangeRate: state.exchangeRate,
          notes: state.notes,
          terms: state.terms,
          paymentDetails: { ...state.paymentDetails },
          themeColor: state.themeColor,
          fontFamily: state.fontFamily,
          status: 'Draft' as InvoiceStatus,
          calculations: { ...state.calculations },
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const existingIndex = state.savedInvoices.findIndex(inv => inv.id === snapshot.id);
          let newSaved = [...state.savedInvoices];
          if (existingIndex >= 0) {
            newSaved[existingIndex] = snapshot;
          } else {
            newSaved.push(snapshot);
          }
          return { savedInvoices: newSaved };
        });
      },

      deleteInvoice: (id) => {
        set((state) => ({
          savedInvoices: state.savedInvoices.filter(inv => inv.id !== id)
        }));
      },
      
      updateInvoiceStatus: (id, status) => {
        set((state) => ({
          savedInvoices: state.savedInvoices.map(inv => 
            inv.id === id ? { ...inv, status } : inv
          )
        }));
      },

      loadInvoice: (id) => {
        const state = get();
        const invoiceToLoad = state.savedInvoices.find(inv => inv.id === id);
        if (invoiceToLoad) {
          set({
            ...invoiceToLoad,
            savedInvoices: state.savedInvoices
          });
          get().recalculate();
        }
      },
      
      createNewInvoice: (profile) => {
        const state = get();
        // Extract number from prefix if possible, else just increment last
        const num = parseInt(state.invoiceNumber) || 0;
        const newNumber = String(num + 1).padStart(3, '0');
        
        set({
          id: generateId(),
          invoiceNumber: newNumber,
          poCode: '',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          client: initialClient,
          dispatchDetails: initialDispatchDetails,
          isReverseCharge: false,
          lineItems: [{ id: generateId(), name: '', description: '', quantity: 1, rate: 0, unit: 'hrs', hsnCode: '', taxRate: 0 }],
          notes: 'Thank you for your business!',
          terms: 'Please pay within 7 days.',
          sender: profile?.sender || initialSender,
          paymentDetails: profile?.paymentDetails || initialPaymentDetails,
        });
        get().recalculate();
      }
    }),
    {
      name: 'invoice-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
