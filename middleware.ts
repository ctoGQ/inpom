import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
      const result = await sql`
        SELECT id FROM customer_sessions 
        WHERE session_token = ${sessionToken} AND expires_at > NOW()
      `;

      if (!result.rows?.length) {
        const redirectUrl = new URL('/auth/signin', request.url);
        const res = NextResponse.redirect(redirectUrl);
        res.cookies.delete('session_token');
        return res;
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
