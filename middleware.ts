import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect cabinet routes
  if (pathname.startsWith('/mycabinet')) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Verify session is valid by checking database
    try {
      if (!process.env.DATABASE_URL) {
        // In local development, if DATABASE_URL is not set, don't crash the middleware.
        // If a session token exists, allow the request to proceed so local auth flows can be tested.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('DATABASE_URL not set — skipping DB session verification in development');
          return NextResponse.next();
        }
        throw new Error('DATABASE_URL is not set');
      }

      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id FROM customer_sessions WHERE session_token = $1 AND expires_at > NOW()',
          [sessionToken]
        );

        if (!result.rows.length) {
          const redirectUrl = new URL('/auth/signin', request.url);
          const res = NextResponse.redirect(redirectUrl);
          res.cookies.delete('session_token');
          return res;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Session verification error:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mycabinet/:path*'],
};
