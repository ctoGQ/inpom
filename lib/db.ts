import { Pool } from '@neondatabase/serverless';
import { QueryResultRow } from '@neondatabase/serverless';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      const guidance = `DATABASE_URL environment variable is not set.\n\nFor local development with Neon, create a file named .env.local at the project root and add your Neon connection string:\n\nDATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require\n\nSee .env.example for a template.`;
      throw new Error(guidance);
    }

    // Use the provided connection string. For local development with Neon,
    // ensure your connection string includes any required SSL parameters.
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
