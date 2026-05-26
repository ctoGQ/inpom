// GET /api/shop/categories/search
// Search for categories by name

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`[Categories Search API] Searching for: "${query}"`);

    let result;

    if (!query.trim()) {
      // If no search query, return all categories sorted by display_order
      result = await sql`
        SELECT id, name, slug, description
        FROM shop_categories
        ORDER BY display_order ASC
        LIMIT ${limit}
      `;
    } else {
      // Search by name using ILIKE (case-insensitive)
      const searchPattern = `%${query}%`;
      result = await sql`
        SELECT id, name, slug, description
        FROM shop_categories
        WHERE name ILIKE ${searchPattern}
        ORDER BY 
          CASE 
            WHEN name ILIKE ${`${query}%`} THEN 1
            ELSE 2
          END,
          display_order ASC
        LIMIT ${limit}
      `;
    }

    console.log(`[Categories Search API] ✅ Found ${result.rows?.length || 0} categories`);

    return NextResponse.json({
      categories: result.rows || [],
      total: result.rows?.length || 0
    });
  } catch (error) {
    console.error('[Categories Search API] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search categories',
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
