'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { MobileModal } from '@/components/mobile-modal';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  User,
  Mail,
  Phone,
  Building2,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  ChevronRight,
  Star,
} from 'lucide-react';

interface EventDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  banner_image_url?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  region: string;
  city: string;
  venue_name: string;
  address: string;
  is_online: boolean;
  stream_url?: string;
  max_participants: number;
  current_participants: number;
  ticket_price: number;
  currency: string;
  discount_percent: number;
  status: string;
  organizer_name: string;
  organizer_description: string;
  organizer_avatar_url?: string;
  organizer_contact_email: string;
  organizer_contact_phone: string;
  meta_description: string;
}

interface Ticket {
  id: number;
  ticket_type: string;
  ticket_name: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);
  const { toast } = useToast();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    specialRequirements: '',
  });

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const fetchEventDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error('Failed to fetch event');
      const data = await res.json();
      setEvent(data.event);
      setTickets(data.tickets || []);
    } catch (err) {
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Не вдалось завантажити событие',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedTicket || !event) return;

    setPurchasing(true);
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          ticketId: selectedTicket.id,
          ...registrationData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Не вдалось купити квиток');
      }

      const data = await res.json();
      setShowPurchaseModal(false);
      toast({
        title: 'Успіх',
        description: `Квиток куплено успішно. Реєстрація #${data.registrationId}`,
      });
      router.push(`/mycabinet/events/${event.id}/confirmation/${data.registrationId}`);
    } catch (err) {
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Не вдалось купити квиток',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <CabinetLayout title="Завантаження..." showBack showAvatar backHref="/mycabinet/events">
        <div className="px-4 pt-6 pb-8 space-y-4">
          <div className="w-full aspect-[16/9] bg-foreground/5 rounded-2xl animate-pulse" />
          <div className="h-6 w-2/3 bg-foreground/5 rounded animate-pulse" />
          <div className="h-20 bg-foreground/5 rounded-2xl animate-pulse" />
          <div className="h-14 bg-foreground/5 rounded-2xl animate-pulse" />
        </div>
      </CabinetLayout>
    );
  }

  if (!event) {
    return (
      <CabinetLayout title="Не знайдено" showBack showAvatar backHref="/mycabinet/events">
        <div className="px-4 pt-16 pb-8 flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="font-semibold text-foreground">Событие не знайдено</p>
          <Link href="/mycabinet/events" className="text-sm text-muted-foreground underline">
            До списку івентів
          </Link>
        </div>
      </CabinetLayout>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const participationPercent = Math.round((event.current_participants / event.max_participants) * 100);

  return (
    <CabinetLayout title={event.title} showBack showAvatar backHref="/mycabinet/events">
      <div className="px-4 pt-6 pb-8 space-y-5">
        {/* Banner */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-foreground/5">
          {event.banner_image_url ? (
            <Image
              src={event.banner_image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {event.status === 'ongoing' && (
            <span className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold">
              🔴 Live трансляція
            </span>
          )}
          {daysUntil > 0 && daysUntil <= 3 && (
            <span className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold">
              {daysUntil === 1 ? 'Завтра!' : `${daysUntil} днів!`}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>
          <p className="text-sm text-muted-foreground">{event.short_description}</p>
        </div>

        {/* Key details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground mb-1">Початок</p>
            <p className="text-sm font-semibold text-foreground">
              {startDate.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' })} {startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground mb-1">Місце</p>
            <p className="text-sm font-semibold text-foreground">
              {event.is_online ? '🌐 Online' : event.city || event.region}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground mb-1">Учасників</p>
            <p className="text-sm font-semibold text-foreground">
              {event.current_participants}/{event.max_participants}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/10">
            <p className="text-xs text-muted-foreground mb-1">Ціна</p>
            <p className="text-sm font-semibold text-foreground">
              {event.ticket_price} {event.currency}
            </p>
          </div>
        </div>

        {/* Participation progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs font-semibold text-foreground">Попередження місць</p>
            <p className="text-xs text-muted-foreground">{participationPercent}%</p>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(participationPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">Про событие</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Location details */}
        {!event.is_online && (
          <div className="rounded-2xl border border-foreground/10 p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Адреса</h3>
            <div className="space-y-2">
              {event.venue_name && (
                <div className="flex gap-2 items-start">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{event.venue_name}</span>
                </div>
              )}
              {event.address && (
                <div className="flex gap-2 items-start">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{event.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Organizer */}
        <div className="rounded-2xl border border-foreground/10 p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Організатор</h3>
          <div className="flex gap-3">
            {event.organizer_avatar_url ? (
              <Image
                src={event.organizer_avatar_url}
                alt={event.organizer_name}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center font-bold text-sm">
                {event.organizer_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground">{event.organizer_name}</p>
              <p className="text-xs text-muted-foreground mt-1">{event.organizer_description}</p>
              <div className="flex gap-3 mt-2">
                {event.organizer_contact_email && (
                  <a href={`mailto:${event.organizer_contact_email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                )}
                {event.organizer_contact_phone && (
                  <a href={`tel:${event.organizer_contact_phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Телефон
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Квитки</h2>
          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map(ticket => {
                const available = ticket.quantity_available - ticket.quantity_sold;
                const soldOut = available <= 0;
                return (
                  <div key={ticket.id} className="rounded-xl border border-foreground/10 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ticket.ticket_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {soldOut ? 'Закінчились' : `Залишилось: ${available}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-foreground">{ticket.price} INPOM</p>
                      <button
                        onClick={() => handleBuyTicket(ticket)}
                        disabled={soldOut}
                        className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        {soldOut ? 'Нема' : 'Купити'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Квитки поки не доступні</p>
          )}
        </div>
      </div>

      {/* Purchase modal */}
      <MobileModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Реєстрація на подію"
      >
        <div className="space-y-4">
          {selectedTicket && (
            <div className="p-3 rounded-lg bg-foreground/5 border border-foreground/10">
              <p className="text-xs text-muted-foreground">Квиток</p>
              <p className="text-sm font-bold text-foreground">{selectedTicket.ticket_name} • {selectedTicket.price} INPOM</p>
            </div>
          )}

          {/* Registration form */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="ПІБ"
              value={registrationData.fullName}
              onChange={(e) => setRegistrationData({...registrationData, fullName: e.target.value})}
              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="email"
              placeholder="Email"
              value={registrationData.email}
              onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="tel"
              placeholder="Телефон"
              value={registrationData.phone}
              onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="text"
              placeholder="Компанія (опціонально)"
              value={registrationData.companyName}
              onChange={(e) => setRegistrationData({...registrationData, companyName: e.target.value})}
              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <textarea
              placeholder="Спеціальні вимоги (опціонально)"
              value={registrationData.specialRequirements}
              onChange={(e) => setRegistrationData({...registrationData, specialRequirements: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setShowPurchaseModal(false)}
              disabled={purchasing}
              className="flex-1 py-3 bg-foreground/5 text-foreground font-medium rounded-lg hover:bg-foreground/10 disabled:opacity-50"
            >
              Скасувати
            </button>
            <button
              onClick={confirmPurchase}
              disabled={purchasing || !registrationData.fullName || !registrationData.email}
              className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {purchasing ? 'Обробка...' : 'Купити'}
            </button>
          </div>
        </div>
      </MobileModal>
    </CabinetLayout>
  );
}
