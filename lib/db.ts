import { Pool } from '@neondatabase/serverless';
import { QueryResultRow } from '@neondatabase/serverless';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

export type QueryResult<T extends QueryResultRow = any> = {
  rows: T[];
  rowCount: number;
};

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query<T>(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } finally {
    client.release();
  }
}

// Helper for template literal queries (similar to @vercel/postgres)
export async function sql<T extends QueryResultRow = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<QueryResult<T>> {
  let text = strings[0];
  const params: any[] = [];
  let paramCount = 1;

  for (let i = 1; i < strings.length; i++) {
    params.push(values[i - 1]);
    text += `$${paramCount++}${strings[i]}`;
  }

  return query<T>(text, params);
}

export const db = {
  query,
  sql,
};
