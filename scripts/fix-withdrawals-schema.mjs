#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runFix() {
  let pool = null;
  let client = null;

  try {
    console.log('🔧 Starting withdrawals schema fix...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set. Please set it before running this script.');
    }

    console.log('📦 Connecting to database...');
    pool = new Pool({ connectionString: databaseUrl });
    client = await pool.connect();
    console.log('✅ Database connection established\n');

    // Read the fix migration file
    const fixPath = resolve(__dirname, '../migrations/005_fix_withdrawals_schema.sql');
    console.log(`📄 Reading fix script from: ${fixPath}`);
    const fixSQL = readFileSync(fixPath, 'utf-8');

    console.log('⚠️  WARNING: This will DROP the existing withdrawals table and recreate it');
    console.log('All existing withdrawal data will be lost!\n');

    console.log('⚙️  Executing fix SQL...\n');
    
    // Split by semicolon and execute each statement
    const statements = fixSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements\n`);

    let successCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const preview = statement.substring(0, 60).replace(/\n/g, ' ');
        console.log(`[${i + 1}/${statements.length}] ${preview}...`);
        await client.query(statement);
        console.log(`  ✅ Success\n`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('========================================');
    console.log('✅ Schema fix completed!');
    console.log(`📊 Results: ${successCount} statements executed`);
    console.log('========================================\n');
    
    // Verify table structure
    console.log('📋 Verifying table structure...\n');
    const tableCheckResult = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'withdrawals' ORDER BY ordinal_position`
    );
    
    if (tableCheckResult.rows.length > 0) {
      console.log('✅ Withdrawals table recreated with correct columns:');
      tableCheckResult.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('❌ Withdrawals table not found - something went wrong');
      process.exit(1);
    }
    
    console.log('\n✅ Schema fix complete! Withdrawal system is ready.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Schema fix failed!');
    console.error('Error:', error.message);
    if (error.detail) console.error('Details:', error.detail);
    if (error.code) console.error('Error Code:', error.code);
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (error) {
        console.error('Error releasing client:', error.message);
      }
    }
    if (pool) {
      try {
        await pool.end();
      } catch (error) {
        console.error('Error closing pool:', error.message);
      }
    }
  }
}

runFix();
