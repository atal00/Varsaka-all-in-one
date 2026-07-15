import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import { generateId, ClientDetails } from './invoiceStore';

export interface ClientStoreState {
  clients: ClientDetails[];
  addClient: (client: Omit<ClientDetails, 'id'>) => void;
  updateClient: (id: string, updates: Partial<ClientDetails>) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientStoreState>()(
  persist(
    (set) => ({
      clients: [],
      addClient: (client) => set((state) => ({
        clients: [...state.clients, { ...client, id: generateId() }]
      })),
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'client-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
