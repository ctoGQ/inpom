'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sql } from '@/lib/db';

export async function hashPassword(password: string): Promise<string> {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'default-salt', 1000, 64, 'sha512')
    .toString('hex');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export async function createSession(customerId: number): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  try {
    await sql`
      INSERT INTO customer_sessions (customer_id, session_token, expires_at, created_at)
      VALUES (${customerId}, ${sessionToken}, ${expiresAt}, NOW())
    `;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  const cookieStore = await cookies();
  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  return sessionToken;
}

export async function getSessionCustomer() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) return null;

  try {
    const result = await sql`
      SELECT c.*, cs.expires_at FROM customers c
      JOIN customer_sessions cs ON c.id = cs.customer_id
      WHERE cs.session_token = ${sessionToken} AND cs.expires_at > NOW()
    `;

    return result.rows?.[0] || null;
  } catch (error) {
    console.error('Error getting session customer:', error);
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (sessionToken) {
    try {
      await sql`
        DELETE FROM customer_sessions WHERE session_token = ${sessionToken}
      `;
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  cookieStore.delete('session_token');
}
