#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sql } from '@neon/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');

    // Read the migration file
    const migrationPath = resolve('./migrations/004_create_withdrawals_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration...');
    
    // Execute the migration
    const result = await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
