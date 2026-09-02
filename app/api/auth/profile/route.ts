import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { sql } from '@/lib/db';

const fields = ['professional_title', 'headline', 'bio', 'services', 'industry', 'location', 'availability', 'website_url', 'instagram_url', 'telegram_url', 'linkedin_url', 'portfolio_url', 'education', 'certifications'] as const;
const jsonFields = ['skills', 'languages', 'work_history'] as const;
const limits: Record<string, number> = { professional_title: 160, headline: 240, bio: 5000, services: 3000, industry: 160, location: 180, availability: 120, education: 3000, certifications: 3000 };
const normalize = (value: unknown, key: string) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new Error(`${key} must be text`);
  const trimmed = value.trim();
  if (trimmed.length > (limits[key] || 500)) throw new Error(`${key} is too long`);
  return trimmed || null;
};
const normalizeList = (value: unknown) => Array.isArray(value) ? value.map(String).map(v => v.trim()).filter(Boolean).slice(0, 50) : typeof value === 'string' ? value.split(',').map(v => v.trim()).filter(Boolean).slice(0, 50) : [];

export async function GET() {
  try {
    const customer = await getSessionCustomer();
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const customer = await getSessionCustomer();
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const name = normalize(body.name, 'name');
    if (!name) return NextResponse.json({ error: "Ім'я не можна залишати порожнім" }, { status: 400 });
    const data: Record<string, unknown> = { name };
    for (const key of fields) data[key] = normalize(body[key], key);
    for (const key of jsonFields) data[key] = JSON.stringify(normalizeList(body[key]));
    if (body.years_experience !== '' && body.years_experience !== null && body.years_experience !== undefined) {
      const years = Number(body.years_experience);
      if (!Number.isInteger(years) || years < 0 || years > 80) return NextResponse.json({ error: 'Некоректний стаж' }, { status: 400 });
      data.years_experience = years;
    } else data.years_experience = null;
    const urls = ['website_url', 'instagram_url', 'telegram_url', 'linkedin_url', 'portfolio_url'];
    for (const key of urls) if (data[key] && !/^https?:\/\//i.test(String(data[key]))) return NextResponse.json({ error: `Посилання ${key} має починатися з http:// або https://` }, { status: 400 });
    await sql`UPDATE customers SET name=${data.name}, professional_title=${data.professional_title}, headline=${data.headline}, bio=${data.bio}, skills=${data.skills}::jsonb, services=${data.services}, industry=${data.industry}, years_experience=${data.years_experience}, location=${data.location}, languages=${data.languages}::jsonb, availability=${data.availability}, website_url=${data.website_url}, instagram_url=${data.instagram_url}, telegram_url=${data.telegram_url}, linkedin_url=${data.linkedin_url}, portfolio_url=${data.portfolio_url}, education=${data.education}, certifications=${data.certifications}, work_history=${data.work_history}::jsonb, updated_at=NOW() WHERE id=${customer.id}`;
    return NextResponse.json({ message: 'Profile updated successfully', customer: { ...customer, ...data, skills: JSON.parse(String(data.skills)), languages: JSON.parse(String(data.languages)), work_history: JSON.parse(String(data.work_history)) } });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
  }
}
