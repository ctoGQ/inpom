'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, CircleUserRound, CreditCard, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MobileBottomNav } from '@/components/cabinet/mobile-bottom-nav';

interface DashboardScreenProps {
  userName: string;
  avatarUrl: string;
}

const tasks = [
  {
    href: '/mycabinet/profile',
    eyebrow: 'Мій Профіль',
    title: 'Заповни свій профіль\nв просторі парламенту',
    reward: '+200 INPOM',
    progress: '25',
    icon: CircleUserRound,
  },
  {
    href: '/mycabinet/cards',
    eyebrow: 'Мої Картки',
    title: 'Відкрий\nДоступ до Gold',
    reward: '+500 INPOM',
    progress: '40',
    icon: CreditCard,
  },
  {
    href: '/mycabinet/pick',
    eyebrow: 'Мій Pick',
    title: 'Обери свої\nможливості',
    reward: '+100 INPOM',
    progress: '60',
    icon: Sparkles,
  },
];

export function DashboardScreen({ userName, avatarUrl }: DashboardScreenProps) {
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
        <section className={`dashboard-welcome ${showArticle ? 'dashboard-welcome-hidden' : ''}`} aria-live="polite">
          <p>Пані, {userName}</p>
          <span>Раді бачити Вас знову!</span>
        </section>

        <section className="dashboard-article dashboard-article-visible" aria-label="Рекомендована стаття">
          <Link href="/newsletter" className="dashboard-article-link">
            <Image src="/images/inpom-leader.jpg" alt="Інтерв’ю про сучасних жінок" fill sizes="(max-width: 700px) 100vw, 420px" className="dashboard-article-image" priority />
            <span className="dashboard-article-gradient" />
            <span className="dashboard-article-copy">
              <strong>Як сучасні жінки<br />реагують на новини</strong>
              <small>Інтерв’ю <ArrowUpRight aria-hidden="true" /></small>
            </span>
          </Link>
        </section>

        <section className="dashboard-tasks" aria-label="Завдання">
          <div className="dashboard-tasks-heading">
            <span>Твої наступні кроки</span>
            <span className="dashboard-tasks-line" />
          </div>
          <div className="dashboard-task-rail">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link href={task.href} className="dashboard-task-card" key={task.href}>
                  <div className="dashboard-task-topline">
                    <span>{task.eyebrow}</span>
                    <span className="dashboard-progress"><Check aria-hidden="true" />{task.progress}</span>
                  </div>
                  <strong>{task.title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</strong>
                  <span className="dashboard-task-reward"><Icon aria-hidden="true" />{task.reward}</span>
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
