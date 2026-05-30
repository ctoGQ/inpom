import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Get event details
    const eventResult = await sql`
      SELECT 
        e.id,
        e.title,
        e.slug,
        e.description,
        e.short_description,
        e.banner_image_url,
        e.event_type,
        e.start_date,
        e.end_date,
        e.region,
        e.city,
        e.venue_name,
        e.address,
        e.is_online,
        e.stream_url,
        e.max_participants,
        COALESCE(COUNT(DISTINCT er.id), 0) as current_participants,
        e.ticket_price,
        e.currency,
        e.discount_percent,
        e.status,
        e.organizer_name,
        e.organizer_description,
        e.organizer_avatar_url,
        e.organizer_contact_email,
        e.organizer_contact_phone,
        e.meta_description
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'confirmed'
      WHERE e.id = ${eventId}
      GROUP BY e.id
    `;

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Get ticket types
    const ticketsResult = await sql`
      SELECT 
        id,
        ticket_type,
        ticket_name,
        price,
        quantity_available,
        COALESCE(SUM(CASE WHEN er.status = 'confirmed' THEN 1 ELSE 0 END), 0) as quantity_sold
      FROM event_tickets et
      LEFT JOIN event_registrations er ON et.id = er.ticket_id
      WHERE et.event_id = ${eventId}
      GROUP BY et.id
      ORDER BY et.price ASC
    `;

    // Get sessions/agenda
    const sessionsResult = await sql`
      SELECT 
        id,
        title,
        description,
        start_time,
        end_time,
        speaker_id,
        room_name
      FROM event_sessions
      WHERE event_id = ${eventId}
      ORDER BY start_time ASC
    `;

    // Get reviews
    const reviewsResult = await sql`
      SELECT 
        id,
        rating,
        review_text,
        created_at,
        customer_name
      FROM event_reviews
      WHERE event_id = ${eventId} AND approved = true
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      event,
      tickets: ticketsResult.rows,
      sessions: sessionsResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch (err) {
    console.error('Error fetching event:', err);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}
