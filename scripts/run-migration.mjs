import { sql } from '../lib/db.ts';

const MIGRATION_SQL = `
-- Step 1: Add card_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN card_id INTEGER REFERENCES user_cards(id);

-- Step 2: Assign existing transactions to the user's first card
UPDATE transactions t
SET card_id = (
  SELECT uc.id 
  FROM user_cards uc 
  WHERE uc.customer_id = (
    SELECT customer_id FROM transactions WHERE id = t.id LIMIT 1
  )
  ORDER BY uc.created_at ASC
  LIMIT 1
)
WHERE card_id IS NULL;

-- Step 3: Make card_id NOT NULL constraint
ALTER TABLE transactions 
ALTER COLUMN card_id SET NOT NULL;

-- Step 4: Create index for performance
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_card_id_created ON transactions(card_id, created_at DESC);
`;

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Split into individual statements
    const statements = MIGRATION_SQL
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('--'))
      .join(' ')
      .split(';')
      .filter(stmt => stmt.trim());

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      console.log(`\n📝 Executing: ${trimmed.substring(0, 60)}...`);
      try {
        await sql(trimmed);
        console.log('✅ Done');
      } catch (error) {
        if (error.message?.includes('already exists')) {
          console.log('⏭️  Column/Index already exists, skipping');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✨ Migration completed successfully!');
    
    // Verify migration
    console.log('\n📊 Verification:');
    const totalTx = await sql`SELECT COUNT(*) as count FROM transactions`;
    const withCardId = await sql`SELECT COUNT(*) as count FROM transactions WHERE card_id IS NOT NULL`;
    
    console.log(`Total transactions: ${totalTx.rows[0]?.count || 0}`);
    console.log(`With card_id: ${withCardId.rows[0]?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
