import { sql } from './lib/db.js';

async function runMigration() {
  try {
    console.log('[Migration] Starting migration: add_payer_customer_id_to_transactions');

    // Add column if it doesn't exist
    await sql`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS payer_customer_id INTEGER
    `;

    console.log('[Migration] ✅ Successfully added payer_customer_id column');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] ❌ Error:', error);
    process.exit(1);
  }
}

runMigration();
