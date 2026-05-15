'use server';

import { sql } from '@/lib/db';

export async function getUserBalance(customerId: number) {
  try {
    const result = await sql`
      SELECT id, card_type, balance FROM user_cards WHERE customer_id = ${customerId}
    `;

    const card = result.rows?.[0];

    if (!card) {
      return { error: 'Карта не знайдена' };
    }

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Error getting user balance:', error);
    return { error: 'Помилка при отриманні балансу' };
  }
}

export async function addDeposit(
  customerId: number,
  amount: number,
  paymentMethod: string
) {
  try {
    if (amount <= 0) {
      return { error: 'Сума повинна бути більше нуля' };
    }

    // Get user card
    const cardResult = await sql`
      SELECT id, balance FROM user_cards WHERE customer_id = ${customerId}
    `;

    const card = cardResult.rows?.[0];

    if (!card) {
      return { error: 'Карта не знайдена' };
    }

    // Update balance
    const newBalance = card.balance + amount;
    await sql`
      UPDATE user_cards SET balance = ${newBalance} WHERE id = ${card.id}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (customer_id, type, amount, description)
      VALUES (${customerId}, 'deposit', ${amount}, 'Депозит через ${paymentMethod}')
    `;

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error('Error adding deposit:', error);
    return { error: 'Помилка при поповненні балансу' };
  }
}

export async function upgradeCard(customerId: number, newCardType: string) {
  try {
    const validCardTypes = ['black', 'gold', 'business plus'];

    if (!validCardTypes.includes(newCardType)) {
      return { error: 'Невірний тип карти' };
    }

    const result = await sql`
      UPDATE user_cards SET card_type = ${newCardType} WHERE customer_id = ${customerId}
      RETURNING card_type, balance
    `;

    if (!result.rows.length) {
      return { error: 'Карта не знайдена' };
    }

    const card = result.rows[0];

    // Create transaction record
    await sql`
      INSERT INTO transactions (customer_id, type, amount, description)
      VALUES (${customerId}, 'card_upgrade', 0, 'Оновлення карти на ${newCardType}')
    `;

    return {
      success: true,
      card,
    };
  } catch (error) {
    console.error('Error upgrading card:', error);
    return { error: 'Помилка при оновленні карти' };
  }
}
