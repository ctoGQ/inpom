import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const region = url.searchParams.get('region');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');

    // Build dynamic query based on filters
    let whereClause = `e.status IN ('published', 'ongoing')`;
    const params: any[] = [];

    if (region && region !== 'all') {
      whereClause += ` AND e.region = $${params.length + 1}`;
      params.push(region);
    }

    if (type && type !== 'all') {
      whereClause += ` AND e.event_type = $${params.length + 1}`;
      params.push(type);
    }

    if (search) {
      whereClause += ` AND (e.title ILIKE $${params.length + 1} OR e.short_description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    params.push(limit, offset);

    const queryString = `
      SELECT 
        e.id,
        e.title,
        e.slug,
        e.short_description,
        e.banner_image_url,
        e.thumbnail_image_url,
        e.event_type,
        e.start_date,
        e.end_date,
        e.region,
        e.city,
        e.is_online,
        e.max_participants,
        COALESCE(COUNT(er.id), 0) as current_participants,
        e.ticket_price,
        e.currency,
        e.discount_percent,
        e.status,
        e.is_featured,
        e.organizer_name,
        e.organizer_avatar_url
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'confirmed'
      WHERE ${whereClause}
      GROUP BY e.id 
      ORDER BY e.is_featured DESC, e.start_date ASC 
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await sql(queryString, params);

    return NextResponse.json({
      events: result.rows,
      total: result.rowCount,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
