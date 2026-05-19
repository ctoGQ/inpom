// GET /api/shop/categories
// Fetch all product categories

import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[Shop Categories API] Fetching categories');

    const result = await sql`
      SELECT 
        id, name, slug, description, icon_url, color, display_order
      FROM shop_categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
    `;

    console.log(
      `[Shop Categories API] ✅ Fetched ${result.rows?.length || 0} categories`
    );

    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('[Shop Categories API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
