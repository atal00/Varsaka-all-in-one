import { openDB, DBSchema } from 'idb';

interface InvoiceDB extends DBSchema {
  'key-val': {
    key: string;
    value: string;
  };
}

const DB_NAME = 'invoice-generator-db';

export const idbStorage = {
  async getDB() {
    return openDB<InvoiceDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('key-val')) {
          db.createObjectStore('key-val');
        }
      },
    });
  },
  async getItem(name: string): Promise<string | null> {
    const db = await this.getDB();
    const value = await db.get('key-val', name);
    return value || null;
  },
  async setItem(name: string, value: string): Promise<void> {
    const db = await this.getDB();
    await db.put('key-val', value, name);
  },
  async removeItem(name: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('key-val', name);
  },
};
