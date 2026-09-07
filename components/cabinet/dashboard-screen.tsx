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
    <div className="dashboard-screen">
      <header className="dashboard-topbar">
        <Link href="/" aria-label="INPOM — на головну">
          <Image src="/images/inpom-logo-full.png" alt="International Parliament of Mothers" width={178} height={45} className="dashboard-logo" priority />
        </Link>
        <Link href="/mycabinet/account" className="dashboard-avatar-link" aria-label="Відкрити акаунт">
          <Image src={avatarUrl} alt={`Фото профілю ${userName}`} width={40} height={40} className="dashboard-avatar" />
          <span className="dashboard-online" aria-hidden="true" />
        </Link>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero" aria-live="polite">
          <div className={`dashboard-welcome ${showArticle ? 'dashboard-welcome-hidden' : ''}`}>
            <p>Пані, {userName}</p>
            <span>Раді бачити Вас знову!</span>
          </div>

          <section className={`dashboard-article ${showArticle ? 'dashboard-article-visible' : ''}`} aria-label="Рекомендована стаття">
            <Link href={activeArticle.id ? `/newsletter/${activeArticle.id}` : '/newsletter'} className="dashboard-article-link">
            <Image src={activeArticle.cover_image_url || '/images/inpom-leader.jpg'} alt={activeArticle.title} fill sizes="(max-width: 700px) 100vw, 420px" className="dashboard-article-image" priority />
            <span className="dashboard-article-gradient" />
            <span className="dashboard-article-copy">
              <strong>{activeArticle.title}</strong>
              <small>{activeArticle.category_name || 'Інтерв’ю'} <ArrowUpRight aria-hidden="true" /></small>
            </span>
                      </Link>
          </section>
        </section>

        <section className="dashboard-tasks" aria-label="Завдання">
          <div className="dashboard-tasks-heading">
            <span>Твої наступні кроки</span>
            <span className="dashboard-tasks-line" />
          </div>
          <div className="dashboard-task-rail">
            {tasks.map((task) => {
              const taskRoute = taskRoutes[task.task_key] || { href: '/mycabinet/dashboard', icon: Sparkles };
              const Icon = taskRoute.icon;
              return (
                <Link href={taskRoute.href} className="dashboard-task-card" key={task.task_key}>
                  <div className="dashboard-task-topline">
                    <span>{task.title}</span>
                    <span className="dashboard-progress"><Check aria-hidden="true" />{task.progress_percent}</span>
                  </div>
                  <strong>{task.description}</strong>
                  <span className="dashboard-task-reward"><Icon aria-hidden="true" />+{task.reward} INPOM</span>
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
