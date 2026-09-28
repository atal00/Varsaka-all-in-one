import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvDbUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Try loading from invoice-generator/.env
  const envPath = path.resolve(__dirname, '../invoice-generator/.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        const val = trimmed.replace(/^DATABASE_URL=/, '').replace(/^["']|["']$/g, '');
        // Default to public schema for root postgres tests
        return val.replace('?schema=invoice_db', '?schema=public');
      }
    }
  }
  return '';
}

export const DB_URL = getEnvDbUrl();
