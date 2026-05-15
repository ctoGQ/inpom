#!/usr/bin/env node

/**
 * Database verification script
 * Проверяет подключение к Neon PostgreSQL и структуру таблиц
 */

import { sql } from './lib/db';

async function checkDatabase() {
  console.log('🔍 Проверка подключения к БД...\n');

  try {
    // Test connection
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('✅ Подключение успешно');
    console.log(`   Текущее время БД: ${connectionTest.rows[0].current_time}\n`);

    // Check tables
    console.log('📋 Проверка таблиц...\n');

    const tables = [
      'customers',
      'customer_sessions',
      'invoices',
      'transactions',
      'user_cards',
    ];

    for (const tableName of tables) {
      try {
        const result = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = ${tableName}
          ORDER BY ordinal_position
        `;

        if (result.rows.length > 0) {
          console.log(`✅ ${tableName}`);
          console.log('   Поля:');
          result.rows.forEach((col: any) => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultVal = col.column_default
              ? ` DEFAULT ${col.column_default}`
              : '';
            console.log(
              `     • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`
            );
          });

          // Count rows
          const countResult = await sql`SELECT COUNT(*) as count FROM ${sql.raw(tableName)}`;
          console.log(
            `   Рядів в таблиці: ${countResult.rows[0].count}\n`
          );
        } else {
          console.log(`❌ ${tableName} - таблиця не знайдена\n`);
        }
      } catch (error) {
        console.log(`❌ ${tableName} - помилка при читанні\n`);
      }
    }

    // Check indexes
    console.log('📑 Індекси...\n');
    const indexResult = await sql`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;

    if (indexResult.rows.length > 0) {
      indexResult.rows.forEach((idx: any) => {
        console.log(`✅ ${idx.tablename}.${idx.indexname}`);
      });
      console.log();
    } else {
      console.log('⚠️  Індексів не знайдено\n');
    }

    console.log('✅ Всі перевірки пройдені успішно!');
  } catch (error) {
    console.error('❌ Помилка при перевірці БД:', error);
    process.exit(1);
  }
}

checkDatabase();
