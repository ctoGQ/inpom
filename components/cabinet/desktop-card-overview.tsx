'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Bell, Check, CreditCard, QrCode, User } from 'lucide-react';
import { formatAmount } from '@/lib/format-amount';

interface CardData {
  id: number;
  card_type: string;
  balance: number;
  customer_id: number;
  isOffer?: boolean;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  invoice_id?: number;
  other_customer_name?: string;
  other_customer_avatar?: string;
}

interface DesktopCardOverviewProps {
  cards: CardData[];
  selectedCardId: number;
  onCardChange: (id: number) => void;
  transactions: Transaction[];
  customerId: number;
  customerAvatar?: string;
  customerName?: string;
  isLoading?: boolean;
}

const cardTone = (type: string) => {
  const key = type.toUpperCase();
  if (key.includes('GOLD')) return 'desktop-card-gold';
  if (key.includes('BUSINESS')) return 'desktop-card-business';
  return 'desktop-card-black';
};

function DesktopActivity({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return <div className="desktop-empty-activity">Поки немає активності для цієї картки.</div>;
  return <div className="desktop-activity-list">{transactions.slice(0, 6).map((transaction) => <Link key={transaction.id} href={`/mycabinet/transactions/${transaction.id}`} className="desktop-activity-row"><span className="desktop-activity-icon">{transaction.type.includes('received') || transaction.type.includes('deposit') ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><span className="desktop-activity-copy"><strong>{transaction.type === 'donation_pending' ? 'Пожертва INPOM' : transaction.other_customer_name || transaction.description || transaction.type.replace(/_/g, ' ')}</strong><small>{new Date(transaction.created_at).toLocaleDateString('uk-UA')}</small></span><span className={transaction.type.includes('received') || transaction.type.includes('deposit') ? 'desktop-activity-positive' : 'desktop-activity-negative'}>{transaction.type.includes('received') || transaction.type.includes('deposit') ? '+' : '-'}{formatAmount(transaction.amount)}</span></Link>)}</div>;
}

export function DesktopCardOverview({ cards, selectedCardId, onCardChange, transactions, customerId, customerAvatar, customerName, isLoading }: DesktopCardOverviewProps) {
  const selected = cards.find((card) => card.id === selectedCardId) || cards[0];
  if (!selected) return null;

  const isOffer = Boolean(selected.isOffer);
  const actions = [
    { href: `/mycabinet/deposit${isOffer ? '' : `?cardId=${selected.id}`}`, label: 'Поповнити', icon: ArrowDownLeft },
    { href: `/mycabinet/create-invoice${isOffer ? '' : `?cardId=${selected.id}`}`, label: 'Створити інвойс', icon: QrCode },
    { href: `/mycabinet/withdraw${isOffer ? '' : `?cardId=${selected.id}`}`, label: 'Вивести', icon: ArrowUpRight },
  ];

  return (
    <div className="desktop-cabinet-view">
      <div className="desktop-cabinet-heading">
        <div>
          <p className="desktop-eyebrow">Особистий кабінет</p>
          <h1>Ваші фінанси</h1>
          <p className="desktop-muted">Керуйте картками, платежами та останньою активністю в одному просторі.</p>
        </div>
        <div className="desktop-user-chip">
          <div className="desktop-user-avatar">{customerAvatar ? <img src={customerAvatar} alt="" /> : <User size={18} />}</div>
          <span>{customerName || 'Профіль'}</span>
        </div>
      </div>

      <div className="desktop-cabinet-grid">
        <section className="desktop-card-panel">
          <div className="desktop-panel-header"><span>Мої картки</span><Bell size={17} aria-label="Сповіщення" /></div>
          <div className={`desktop-primary-card ${cardTone(selected.card_type)}`}>
            <div className="desktop-primary-card-top"><span>{selected.card_type}</span><CreditCard size={22} /></div>
            <div>
              <p className="desktop-card-label">{isOffer ? 'Доступна картка' : 'Доступний баланс'}</p>
              <strong>{isOffer ? 'Відкрити пропозицію' : formatAmount(selected.balance)}</strong>
            </div>
            <div className="desktop-primary-card-bottom"><span>INPOM</span><span>•••• {String(selected.id).padStart(4, '0').slice(-4)}</span></div>
          </div>
          <div className="desktop-card-selector" role="tablist" aria-label="Вибір картки">
            {cards.map((card) => <button key={card.id} type="button" role="tab" aria-selected={card.id === selected.id} className={card.id === selected.id ? 'is-active' : ''} onClick={() => onCardChange(card.id)}><span className={`desktop-card-dot ${cardTone(card.card_type)}`} />{card.card_type}{card.id === selected.id && <Check size={15} />}</button>)}
          </div>
          <div className="desktop-action-grid">
            {actions.map(({ href, label, icon: Icon }) => <Link href={href} key={label} className="desktop-action-button"><Icon size={18} /><span>{label}</span><ArrowUpRight size={14} className="desktop-action-arrow" /></Link>)}
          </div>
        </section>
        <section className="desktop-activity-panel">
          <div className="desktop-panel-header"><span>Остання активність</span><Link href="/mycabinet/transactions">Переглянути всі</Link></div>
          {isLoading ? <div className="desktop-loading">Завантаження активності...</div> : <DesktopActivity transactions={transactions} />}
        </section>
      </div>
    </div>
  );
}
