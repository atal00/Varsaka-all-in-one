import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import { SenderDetails, PaymentDetails } from './invoiceStore';

export interface ProfileState {
  sender: SenderDetails;
  paymentDetails: PaymentDetails;
  updateProfile: (updates: Partial<ProfileState>) => void;
}

const defaultSender: SenderDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const defaultPaymentDetails: PaymentDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingCode: '',
  ifscCode: '',
  swiftCode: '',
  bankAddress: '',
  bankNotes: '',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      sender: defaultSender,
      paymentDetails: defaultPaymentDetails,
      updateProfile: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
