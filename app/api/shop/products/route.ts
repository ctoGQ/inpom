// GET /api/shop/products
// Fetch products with filtering, sorting, and search

import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface QueryParams {
  search?: string;
  category?: string;
  sortBy?: 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating';
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  seller_id?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: QueryParams = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      seller_id: searchParams.get('seller_id') || undefined
    };

    console.log('[Shop Products API] Fetching with params:', JSON.stringify(params));

    const limit = Math.min(parseInt(params.limit || '20'), 100);
    const page = Math.max(parseInt(params.page || '1'), 1);
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id, p.title, p.slug, p.description, p.short_description,
        p.price, p.original_price, p.currency, p.stock_quantity,
        p.rating, p.review_count, p.view_count, p.sale_count,
        p.status, p.is_featured, p.created_at,
        c.name as category_name, c.slug as category_slug,
        cu.name as seller_name, cu.id as seller_id, cu.avatar_url as seller_avatar,
        spi.image_url as primary_image
      FROM shop_products p
      JOIN shop_categories c ON p.category_id = c.id
      JOIN customers cu ON p.seller_id = cu.id
      LEFT JOIN shop_product_images spi ON p.id = spi.product_id AND spi.is_primary = TRUE
      WHERE p.status = 'active'
    `;

    const params_array: any[] = [];

    // Search filter
    if (params.search) {
      query += ` AND (p.title ILIKE $${params_array.length + 1} OR p.description ILIKE $${params_array.length + 1})`;
      params_array.push(`%${params.search}%`);
    }

    // Category filter
    if (params.category) {
      query += ` AND c.slug = $${params_array.length + 1}`;
      params_array.push(params.category);
    }

    // Seller filter
    if (params.seller_id) {
      query += ` AND p.seller_id = $${params_array.length + 1}`;
      params_array.push(parseInt(params.seller_id));
    }

    // Price range filter
    if (params.minPrice) {
      query += ` AND p.price >= $${params_array.length + 1}`;
      params_array.push(parseFloat(params.minPrice));
    }

    if (params.maxPrice) {
      query += ` AND p.price <= $${params_array.length + 1}`;
      params_array.push(parseFloat(params.maxPrice));
    }

    // Sorting
    const sortMap: Record<string, string> = {
      newest: 'p.created_at DESC',
      popular: 'p.sale_count DESC',
      'price-asc': 'p.price ASC',
      'price-desc': 'p.price DESC',
      rating: 'p.rating DESC'
    };

    query += ` ORDER BY ${sortMap[params.sortBy] || sortMap.newest}`;

    // Pagination
    query += ` LIMIT $${params_array.length + 1} OFFSET $${params_array.length + 2}`;
    params_array.push(limit, offset);

    const result = await sql.unsafe(query, params_array);

    // Count total
    let countQuery = `SELECT COUNT(*) as total FROM shop_products p
                     JOIN shop_categories c ON p.category_id = c.id
                     WHERE p.status = 'active'`;
    const countParams: any[] = [];

    if (params.search) {
      countQuery += ` AND (p.title ILIKE $1 OR p.description ILIKE $1)`;
      countParams.push(`%${params.search}%`);
    }

    if (params.category) {
      countQuery += ` AND c.slug = $${countParams.length + 1}`;
      countParams.push(params.category);
    }

    const countResult = await sql.unsafe(countQuery, countParams);
    const total = (countResult.rows && countResult.rows.length > 0) ? parseInt(countResult.rows[0].total) : 0;

    console.log(
      `[Shop Products API] ✅ Fetched ${result.rows?.length || 0} products, total: ${total}`
    );

    return NextResponse.json({
      products: result.rows || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Shop Products API] ❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
    
    // Check if it's a table not found error
    if (errorMessage.includes('does not exist') || errorMessage.includes('shop_products')) {
      console.error('[Shop Products API] Database tables not found. Run migration first.');
      return NextResponse.json(
        { 
          error: 'Database not initialized. Please run migrations.',
          details: errorMessage
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    );
  }
}
