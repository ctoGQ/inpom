'use server';

import { hashPassword, createSession, verifyPassword } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validation
  if (!email || !name || !password) {
    return { error: 'Всі поля обов\'язкові' };
  }

  if (password !== confirmPassword) {
    return { error: 'Паролі не збігаються' };
  }

  if (password.length < 8) {
    return { error: 'Пароль мусить бути мінімум 8 символів' };
  }

  try {
    // Check if email exists
    const existingResult = await sql`
      SELECT id FROM customers WHERE email = ${email}
    `;

    if (existingResult.rows.length > 0) {
      return { error: 'Користувач з таким email вже існує' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create customer
    const result = await sql`
      INSERT INTO customers (email, name, password_hash, is_active, created_at, updated_at)
      VALUES (${email}, ${name}, ${passwordHash}, true, NOW(), NOW())
      RETURNING id
    `;

    if (!result.rows.length) {
      return { error: 'Помилка при створенні акаунту' };
    }

    const customerId = result.rows[0].id as number;
    await createSession(customerId);

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'Помилка при створенні акаунту. Спробуйте пізніше.' };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email та пароль обов\'язкові' };
  }

  try {
    const result = await sql`
      SELECT id, password_hash FROM customers WHERE email = ${email} AND is_active = true
    `;

    const customer = result.rows?.[0];
    if (!customer) {
      return { error: 'Невірний email або пароль' };
    }

    const isPasswordValid = await verifyPassword(password, customer.password_hash as string);
    if (!isPasswordValid) {
      return { error: 'Невірний email або пароль' };
    }

    await createSession(customer.id as number);
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Помилка при авторизації. Спробуйте пізніше.' };
  }
}
