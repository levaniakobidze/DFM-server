require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DIRECT_URL (no pgbouncer flag) so we get a stable single connection
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('✓ Connected to database\n');

  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');

  // Strip comment lines then split on ;
  const statements = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements...\n`);

  for (const statement of statements) {
    try {
      await client.query(statement);
      console.log('✓', statement.slice(0, 80).replace(/\s+/g, ' '));
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠ skipped (exists):', statement.slice(0, 70).replace(/\s+/g, ' '));
      } else {
        console.error('\n❌ Failed:', statement.replace(/\s+/g, ' '));
        console.error('   Error:', e.message);
        await client.end();
        process.exit(1);
      }
    }
  }

  await client.end();
  console.log('\n✅ Schema applied successfully.');
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });
