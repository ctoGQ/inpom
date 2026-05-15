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
