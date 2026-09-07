import { sql } from '@/lib/db';

export type CabinetTask = {
  task_key: string;
  title: string;
  description: string;
  reward: number;
  progress_percent: number;
  completed_at: string | null;
};

const PROFILE_FIELDS = ['professional_title', 'headline', 'bio', 'services', 'industry', 'location', 'availability', 'education', 'certifications'];

export async function updateCabinetTask(customerId: number, taskKey: string, progressPercent: number) {
  const task = await sql<{ id: number; reward: number }>`SELECT id, reward FROM cabinet_tasks WHERE task_key = ${taskKey}`;
  if (!task.rows[0]) return { completed: false, rewarded: false };

  const progress = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const existing = await sql<{ completed_at: string | null }>`
    SELECT completed_at FROM customer_tasks WHERE customer_id = ${customerId} AND task_id = ${task.rows[0].id}
  `;
  if (existing.rows[0]?.completed_at) return { completed: true, rewarded: false };

  if (progress < 100) {
    await sql`
      INSERT INTO customer_tasks (customer_id, task_id, progress_percent, updated_at)
      VALUES (${customerId}, ${task.rows[0].id}, ${progress}, NOW())
      ON CONFLICT (customer_id, task_id) DO UPDATE SET progress_percent = EXCLUDED.progress_percent, updated_at = NOW()
    `;
    return { completed: false, rewarded: false };
  }

  const card = await sql<{ id: number }>`SELECT id FROM user_cards WHERE customer_id = ${customerId} ORDER BY created_at ASC LIMIT 1`;
  if (!card.rows[0]) return { completed: false, rewarded: false };

  const transaction = await sql<{ id: number }>`
    INSERT INTO transactions (customer_id, card_id, type, amount, description, created_at)
    VALUES (${customerId}, ${card.rows[0].id}, 'deposit', ${task.rows[0].reward}, ${`Task reward: ${taskKey}`}, NOW()) RETURNING id
  `;
  await sql`UPDATE user_cards SET balance = balance + ${task.rows[0].reward} WHERE id = ${card.rows[0].id} AND customer_id = ${customerId}`;
  await sql`
    INSERT INTO customer_tasks (customer_id, task_id, progress_percent, completed_at, reward_transaction_id, updated_at)
    VALUES (${customerId}, ${task.rows[0].id}, 100, NOW(), ${transaction.rows[0].id}, NOW())
    ON CONFLICT (customer_id, task_id) DO UPDATE SET progress_percent = 100, completed_at = NOW(), reward_transaction_id = EXCLUDED.reward_transaction_id, updated_at = NOW()
  `;
  return { completed: true, rewarded: true };
}

export async function syncProfileTask(customer: Record<string, unknown> & { id: number; avatar_url?: string | null }) {
  const completedFields = PROFILE_FIELDS.filter((field) => String(customer[field] ?? '').trim().length > 0).length;
  const photoProgress = customer.avatar_url ? 10 : 0;
  return updateCabinetTask(customer.id, 'complete_profile', Math.min(100, Math.round((completedFields / PROFILE_FIELDS.length) * 90) + photoProgress));
}

export async function getCabinetTasks(customerId: number): Promise<CabinetTask[]> {
  const result = await sql<CabinetTask>`
    SELECT t.task_key, t.title, t.description, t.reward,
      COALESCE(ct.progress_percent, 0) AS progress_percent, ct.completed_at
    FROM cabinet_tasks t
    LEFT JOIN customer_tasks ct ON ct.task_id = t.id AND ct.customer_id = ${customerId}
    ORDER BY t.sort_order
  `;
  return result.rows.map((task) => ({ ...task, reward: Number(task.reward), progress_percent: Number(task.progress_percent) }));
}
