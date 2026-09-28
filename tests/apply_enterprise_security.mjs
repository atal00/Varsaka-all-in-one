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
  console.log('🚀 Applying Enterprise Security Hardening SQL Migration...');
  const sqlFile = path.resolve('enterprise_security_hardening.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split by statements or execute blocks
  // Since some functions contain semicolons inside $$, let's execute the file
  // In pg/postgres we can execute multiple statements if we do it via raw postgres or split carefully.
  // Note: Prisma $executeRawUnsafe rejects multiple commands in a single statement.
  // Let's check if pg package or prisma can execute block-by-block.

  // Let's parse statements respecting $$ blocks!
  const statements = [];
  let currentStmt = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!inDollarQuote && trimmed.startsWith('--')) {
      continue; // Skip single line comments
    }

    // Check for $$
    const dollarMatches = line.match(/\$\$|\$[a-zA-Z0-9_]*\$/g);
    if (dollarMatches) {
      for (const match of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = match;
        } else if (match === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    currentStmt += line + '\n';

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const cleanStmt = currentStmt.trim();
      if (cleanStmt.length > 0) {
        statements.push(cleanStmt);
      }
      currentStmt = '';
    }
  }

  if (currentStmt.trim().length > 0) {
    statements.push(currentStmt.trim());
  }

  console.log(`Parsed ${statements.length} SQL statements. Executing sequentially...`);

  let count = 0;
  for (const stmt of statements) {
    count++;
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  [${count}/${statements.length}] SUCCESS: ${stmt.slice(0, 50).replace(/\n/g, ' ')}...`);
    } catch (err) {
      console.error(`  [${count}/${statements.length}] FAILED: ${stmt.slice(0, 80).replace(/\n/g, ' ')}...`);
      console.error('  Error message:', err.message);
      throw err;
    }
  }

  console.log('✅ All Enterprise Security Hardening SQL Migration statements applied successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
