// GET  /api/shop/products/[id]/comments  — list comments
// POST /api/shop/products/[id]/comments  — post a comment (auth required)

import { sql } from '@/lib/db';
import { getSessionCustomer } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (!productId || isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Top-level comments with author info, ordered newest first.
    // Replies are returned in the same list — the client nests them by parent_id.
    const result = await sql`
      SELECT
        c.id,
        c.product_id,
        c.parent_id,
        c.content,
        c.is_deleted,
        c.is_edited,
        c.likes_count,
        c.created_at,
        cu.id   AS author_id,
        cu.name AS author_name,
        cu.avatar_url AS author_avatar
      FROM shop_product_comments c
      JOIN customers cu ON cu.id = c.author_id
      WHERE c.product_id = ${productId}
      ORDER BY c.created_at ASC
    `;

    // Mask deleted comment content but keep structure for replies
    const comments = (result.rows || []).map((row: any) => ({
      ...row,
      content: row.is_deleted ? '[коментар видалено]' : row.content,
      author_name: row.is_deleted ? null : row.author_name,
      author_avatar: row.is_deleted ? null : row.author_avatar,
    }));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('[Product Comments GET] ❌', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// ── POST ─────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (!productId || isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const content: string = (body.content || '').trim();
    const parentId: number | null = body.parent_id ? parseInt(body.parent_id) : null;

    if (!content) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 });
    }

    // Ensure the product exists and is active (or belongs to the commenter)
    const productCheck = await sql`
      SELECT id FROM shop_products
      WHERE id = ${productId} AND (status = 'active' OR seller_id = ${customer.id})
    `;
    if (!productCheck.rows?.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validate parent comment belongs to the same product
    if (parentId) {
      const parentCheck = await sql`
        SELECT id FROM shop_product_comments
        WHERE id = ${parentId} AND product_id = ${productId} AND is_deleted = FALSE
      `;
      if (!parentCheck.rows?.length) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    const result = await sql`
      INSERT INTO shop_product_comments (product_id, author_id, parent_id, content)
      VALUES (
        ${productId},
        ${customer.id},
        ${parentId},
        ${content}
      )
      RETURNING id, product_id, parent_id, content, is_edited, likes_count, created_at
    `;

    const comment = result.rows?.[0];
    if (!comment) throw new Error('Insert returned no row');

    return NextResponse.json(
      {
        comment: {
          ...comment,
          author_id: customer.id,
          author_name: customer.name,
          author_avatar: customer.avatar_url || null,
          is_deleted: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Product Comments POST] ❌', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
