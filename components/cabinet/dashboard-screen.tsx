'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, CircleUserRound, CreditCard, FileText, Package, ShoppingBag, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileBottomNav } from '@/components/cabinet/mobile-bottom-nav';

interface DashboardTask {
  task_key: string;
  title: string;
  description: string;
  reward: number;
  progress_percent: number;
  completed_at: string | null;
}

interface DashboardArticle {
  id: string;
  title: string;
  cover_image_url: string | null;
  category_name: string | null;
}

interface DashboardScreenProps {
  userName: string;
  avatarUrl: string;
  tasks: DashboardTask[];
  article: DashboardArticle | null;
}

const taskRoutes: Record<string, { href: string; icon: typeof CircleUserRound }> = {
  complete_profile: { href: '/mycabinet/account/edit', icon: CircleUserRound },
  open_gold_card: { href: '/mycabinet/cards', icon: CreditCard },
  first_50_picks: { href: '/pick', icon: Sparkles },
  create_first_invoice: { href: '/mycabinet/invoices', icon: FileText },
  create_first_product: { href: '/mycabinet/shop', icon: Package },
  buy_first_product: { href: '/mycabinet/shop', icon: ShoppingBag },
};

const fallbackArticle: DashboardArticle = {
  id: '',
  title: 'Як сучасні жінки реагують на новини',
  cover_image_url: '/images/inpom-leader.jpg',
  category_name: 'Інтерв’ю',
};

export function DashboardScreen({ userName, avatarUrl, tasks, article }: DashboardScreenProps) {
  const activeArticle = article ?? fallbackArticle;
  const [showArticle, setShowArticle] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowArticle(true), 2700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative isolate h-[100svh] min-h-[100svh] overflow-hidden bg-[#F5F5F7] text-[#101015] dark:bg-gradient-to-b dark:from-black dark:to-[#181725] dark:text-[#f5f4f8] [&_.cabinet-bottom-nav]:bg-transparent [&_.cabinet-bottom-nav]:border-t-transparent [&_.cabinet-bottom-nav]:shadow-none [&_.cabinet-bottom-nav]:text-[rgba(16,16,21,.58)] dark:[&_.cabinet-bottom-nav]:text-[rgba(245,244,248,.58)] [&_.cabinet-nav-item.active]:text-[#26a9ff] [&_.cabinet-nav-item:hover]:text-[#101015] dark:[&_.cabinet-nav-item:hover]:text-[#f5f4f8]">
      <header className="fixed inset-x-0 top-0 z-[50] mx-auto flex w-full max-w-3xl items-center justify-between p-3">
        <Link href="/" aria-label="INPOM — на головну">
          <Image src="/images/inpom-logo-full.png" alt="International Parliament of Mothers" width={178} height={45} className="h-auto w-32 object-contain" priority />
        </Link>
        <Link href="/mycabinet/account" className="relative mt-0.5 inline-flex" aria-label="Відкрити акаунт">
          <Image src={avatarUrl} alt={`Фото профілю ${userName}`} width={40} height={40} className="h-10 w-10 rounded-full border-2 border-foreground/20  object-cover" />
          <span className="absolute bottom-0 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-[#e00070]" aria-hidden="true" />
        </Link>
      </header>

      <main className="absolute inset-0 mx-auto grid h-[100svh] w-full max-w-3xl grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden px-3 pb-20 pt-20 sm:px-8">
        <section className="relative min-h-0 min-w-0 bg-transparent" aria-live="polite">
          <div className={`absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 text-center transition-[opacity,transform] duration-700 ease-[ease] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-800 motion-safe:ease-[ease] motion-reduce:animate-none motion-reduce:transition-none ${showArticle ? '-translate-y-3 opacity-0' : ''}`}>
            <span className="m-0 text-3xl font-medium leading-tight">Пані, {userName}</span>
            <span className="text-base font-medium">Раді бачити Вас знову!</span>
          </div>

          <section className={`absolute inset-0 m-0 max-h-[50vh] w-full bg-transparent translate-y-4 opacity-0 transition-[opacity,transform] duration-800 ease-[ease] pointer-events-none motion-reduce:transition-none ${showArticle ? 'pointer-events-auto translate-y-0 opacity-100' : ''}`} aria-label="Рекомендована стаття">
            <Link href={activeArticle.id ? `/newsletter/${activeArticle.id}` : '/newsletter'} className="relative block h-full w-full overflow-hidden rounded-3xl bg-transparent">
              <Image src={activeArticle.cover_image_url || '/images/inpom-leader.jpg'} alt={activeArticle.title} fill sizes="(max-width: 700px) 100vw, 420px" className="object-cover object-center" priority />
              <span className="absolute inset-[35%_0_0] bg-[linear-gradient(180deg,transparent,rgba(15,14,26,.98)_72%)]" />
              <span className="absolute inset-x-3 bottom-10 flex flex-col items-center gap-4 p-4 text-center">
                <span className="max-w-full text-3xl font-normal leading-tight text-white [overflow-wrap:anywhere]">{activeArticle.title}</span>
                <span className="inline-flex items-center gap-1 text-base text-[#0df08a]">{activeArticle.category_name || 'Інтерв’ю'} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></span>
              </span>
            </Link>
          </section>
        </section>

        <section className="mb-4 min-h-0 min-w-0 w-full bg-transparent" aria-label="Завдання">
          <div className="flex space-x-4 overflow-x-auto overscroll-x-contain py-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tasks.map((task) => {
              const taskRoute = taskRoutes[task.task_key] || { href: '/mycabinet/dashboard', icon: Sparkles };
              const Icon = taskRoute.icon;
              const progressPercent = Math.min(100, Math.max(0, task.progress_percent));
              const isCompleted = Boolean(task.completed_at) || progressPercent >= 100;
              return (
                <Link href={taskRoute.href} className="flex min-w-0 shrink-0 basis-2/3 flex-col justify-between rounded-3xl bg-white p-3 text-[#101015] no-underline transition-transform duration-200 hover:-translate-y-1 hover:outline-2 hover:outline-[#0df08a] hover:outline-offset-2 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#0df08a] focus-visible:outline-offset-2" key={task.task_key}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="pl-1 text-sm">{task.title}</span>
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full p-1 text-xs"
                      style={{ background: `conic-gradient(#28d77b ${progressPercent}%, #d7d7d9 0)` }}
                      aria-label={`Прогрес: ${progressPercent}%`}
                    >
                      <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white">
                        {isCompleted ? <Check aria-hidden="true" className="h-3 w-3 text-[#0bba6b]" /> : progressPercent}
                      </span>
                    </span>
                  </div>
                  <strong className="py-5 flex text-md leading-tight">{task.description}</strong>
                  <span className="pb-1 inline-flex items-center gap-1 text-xs font-bold text-[#8b8b91]"><Icon aria-hidden="true" className="h-4 w-4" />+{task.reward} INPOM</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <MobileBottomNav alwaysVisible />
    </div>
  );
}
