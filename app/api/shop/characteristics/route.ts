// GET /api/shop/characteristics
// Search for product characteristics with autocomplete

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    let characteristics: any[] = [];

    if (search && search.length > 0) {
      // Search with pattern matching (ILIKE for case-insensitive)
      const result = await sql`
        SELECT id, name, category
        FROM shop_characteristics_catalog
        WHERE is_active = TRUE 
          AND name ILIKE ${`%${search}%`}
        ORDER BY display_order ASC
        LIMIT ${limit}
      `;
      characteristics = result.rows || [];
    } else {
      // Return all characteristics if no search
      const result = await sql`
        SELECT id, name, category
        FROM shop_characteristics_catalog
        WHERE is_active = TRUE
        ORDER BY display_order ASC
        LIMIT ${limit}
      `;
      characteristics = result.rows || [];
    }

    console.log(`[Characteristics API] Found ${characteristics.length} characteristics for search: "${search}"`);

    return NextResponse.json({
      characteristics,
      count: characteristics.length
    });
  } catch (error) {
    console.error('[Characteristics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch characteristics',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined
      },
      { status: 500 }
    );
  }
}
