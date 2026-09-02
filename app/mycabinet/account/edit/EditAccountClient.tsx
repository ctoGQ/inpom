'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type FormData = Record<string, string | string[]>;
const textFields = [
  ['professional_title', 'Професійний заголовок', 'Наприклад: SMM-спеціаліст та стратег'], ['headline', 'Коротко про себе', 'Одним реченням: чим ви корисні клієнтам?'], ['industry', 'Ніша', 'Маркетинг, бʼюті, освіта...'], ['location', 'Місто / країна', 'Київ, Україна'], ['availability', 'Доступність', 'Наприклад: 10 годин на тиждень'], ['services', 'Послуги та товари', 'Що саме ви пропонуєте, для кого і в якому форматі?'], ['bio', 'Про мене', 'Розкажіть про досвід, підхід та результати'], ['education', 'Освіта', ''], ['certifications', 'Сертифікати та досягнення', ''], ['website_url', 'Сайт', 'https://'], ['instagram_url', 'Instagram', 'https://instagram.com/'], ['telegram_url', 'Telegram', 'https://t.me/'], ['linkedin_url', 'LinkedIn', 'https://linkedin.com/in/'], ['portfolio_url', 'Портфоліо', 'https://'],
] as const;
const initial = Object.fromEntries(textFields.map(([key]) => [key, ''])) as FormData;
initial.name = ''; initial.email = ''; initial.skills = []; initial.languages = []; initial.work_history = [];

export default function EditAccountClient() {
  const router = useRouter(); const { toast } = useToast();
  const [form, setForm] = useState<FormData>(initial); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/auth/profile').then(async r => { if (!r.ok) return router.push('/auth/signin'); const { customer } = await r.json(); setForm({ ...initial, ...customer, skills: customer.skills || [], languages: customer.languages || [], work_history: customer.work_history || [] }); }).catch(() => toast({ title: 'Помилка', description: 'Не вдалося завантажити профіль', variant: 'destructive' })).finally(() => setLoading(false)); }, [router, toast]);
  const set = (key: string, value: string | string[]) => setForm(f => ({ ...f, [key]: value }));
  const list = (key: 'skills' | 'languages') => Array.isArray(form[key]) ? form[key].join(', ') : String(form[key] || '');
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); const payload = { ...form, skills: list('skills').split(',').map(v => v.trim()).filter(Boolean), languages: list('languages').split(',').map(v => v.trim()).filter(Boolean) }; const r = await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); setSaving(false); if (r.ok) { toast({ title: 'Успіх', description: 'Профіль оновлено' }); router.push('/mycabinet/account'); } else { const error = await r.json(); toast({ title: 'Помилка', description: error.error || 'Не вдалося зберегти', variant: 'destructive' }); } };
  if (loading) return <CabinetLayout title="Редагувати" showBack showAvatar showNav><p className="p-6 text-sm text-muted-foreground">Завантаження...</p></CabinetLayout>;
  return <CabinetLayout title="Редагувати профіль" showBack showAvatar showNav><form onSubmit={submit} className="flex flex-col gap-6 px-4 pt-6 pb-28">
    <section className="flex flex-col gap-4"><h2 className="text-lg font-semibold">Позиціонування</h2><label className="text-sm">Ім&apos;я<Input name="name" value={String(form.name)} onChange={e => set('name', e.target.value)} required /></label>{textFields.slice(0, 4).map(([key, label, placeholder]) => <label key={key} className="text-sm">{label}<Input value={String(form[key] || '')} placeholder={placeholder} onChange={e => set(key, e.target.value)} /></label>)}<label className="text-sm">Email<Input value={String(form.email)} disabled /></label></section>
    <section className="flex flex-col gap-4"><h2 className="text-lg font-semibold">Послуги та досвід</h2>{textFields.slice(4, 9).map(([key, label, placeholder]) => <label key={key} className="text-sm">{label}<Textarea value={String(form[key] || '')} placeholder={placeholder} onChange={e => set(key, e.target.value)} /></label>)}<label className="text-sm">Років досвіду<Input type="number" min="0" max="80" value={String(form.years_experience || '')} onChange={e => set('years_experience', e.target.value)} /></label><label className="text-sm">Навички, через кому<Input value={list('skills')} onChange={e => set('skills', e.target.value.split(','))} /></label><label className="text-sm">Мови, через кому<Input value={list('languages')} onChange={e => set('languages', e.target.value.split(','))} /></label></section>
    <section className="flex flex-col gap-4"><h2 className="text-lg font-semibold">Контакти та освіта</h2>{textFields.slice(9).map(([key, label, placeholder]) => <label key={key} className="text-sm">{label}<Input value={String(form[key] || '')} placeholder={placeholder} onChange={e => set(key, e.target.value)} /></label>)}</section>
    <div className="flex gap-3"><Button type="submit" disabled={saving} className="flex-1">{saving ? 'Збереження...' : 'Зберегти'}</Button><Button type="button" variant="outline" onClick={() => router.back()} disabled={saving} className="flex-1">Скасувати</Button></div>
  </form></CabinetLayout>;
}
