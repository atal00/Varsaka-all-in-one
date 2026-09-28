import { DB_URL } from './db_env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL
    }
  }
});

async function main() {
  console.log('🚀 Applying CMS Schema & Data SQL Migration...');
  const sqlFile = path.resolve('update_cms_schema_and_data.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');

  // Split SQL while respecting dollar-quoted strings and statements
  const statements = [];
  let currentStmt = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sqlContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inDollarQuote && (trimmed.startsWith('--') || trimmed === '')) {
      continue;
    }

    const match = line.match(/\$\$|\$[a-zA-Z0-9_]+\$/g);
    if (match) {
      for (const m of match) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = m;
        } else if (inDollarQuote && m === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    currentStmt += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmtToPush = currentStmt.trim();
      if (stmtToPush.length > 0) {
        statements.push(stmtToPush);
      }
      currentStmt = '';
    }
  }

  if (currentStmt.trim().length > 0) {
    statements.push(currentStmt.trim());
  }

  console.log(`Parsed ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`✓ [${i + 1}/${statements.length}] Executed statement successfully`);
    } catch (err) {
      console.error(`✗ [${i + 1}/${statements.length}] Failed executing:`, stmt.substring(0, 80));
      console.error('Error:', err.message);
      throw err;
    }
  }

  console.log('🎉 CMS Schema & Data Migration applied successfully!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
