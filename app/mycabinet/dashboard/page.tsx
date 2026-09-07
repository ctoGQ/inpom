import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';
import { getCabinetTasks } from '@/lib/cabinet-tasks';
import { DashboardScreen } from '@/components/cabinet/dashboard-screen';

async function getDashboardArticle() {
  const result = await sql<{ id: string; title: string; cover_image_url: string | null; category_name: string | null }>`
    SELECT na.id::text, na.title, na.cover_image_url, nc.name AS category_name
    FROM newsletter_articles na
    LEFT JOIN newsletter_categories nc ON na.category_id = nc.id
    WHERE na.status = 'published'
    ORDER BY na.published_at DESC NULLS LAST
    LIMIT 1
  `;
  return result.rows[0] ?? null;
}

export default async function DashboardPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const [tasks, article] = await Promise.all([
    getCabinetTasks(customer.id),
    getDashboardArticle(),
  ]);

  return (
    <DashboardScreen
      userName={customer.name || 'учаснице'}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      tasks={tasks}
      article={article}
    />
  );
}
