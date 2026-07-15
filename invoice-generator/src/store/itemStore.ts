import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '../lib/storage';
import { generateId } from './invoiceStore';

export interface SavedItem {
  id: string;
  name: string;
  description: string;
  rate: number;
  unit: string;
}

export interface ItemStoreState {
  items: SavedItem[];
  addItem: (item: Omit<SavedItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<SavedItem>) => void;
  deleteItem: (id: string) => void;
}

export const useItemStore = create<ItemStoreState>()(
  persist(
    (set) => ({
      items: [
        { id: generateId(), name: 'Monthly Retainer', description: 'Standard monthly retainer', rate: 2500, unit: 'mo' },
        { id: generateId(), name: 'Consulting Hour', description: 'Expert consultation', rate: 150, unit: 'hr' }
      ],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: generateId() }]
      })),
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
    }),
    {
      name: 'item-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
