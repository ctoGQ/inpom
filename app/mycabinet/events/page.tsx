'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ChevronRight,
  Search,
  AlertCircle,
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  banner_image_url?: string;
  thumbnail_image_url?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  region: string;
  city: string;
  is_online: boolean;
  max_participants: number;
  current_participants: number;
  ticket_price: number;
  currency: string;
  discount_percent: number;
  status: string;
  is_featured: boolean;
  organizer_name: string;
  organizer_avatar_url?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  webinar: 'Вебінар',
  conference: 'Конференція',
  workshop: 'Воркшоп',
  masterclass: 'Мастеркласс',
  concert: 'Концерт',
  exhibition: 'Виставка',
  networking: 'Нетворкінг',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

function EventCard({ event }: { event: Event }) {
  const discount = event.discount_percent ? Math.round(event.discount_percent) : 0;
  const participationPercent = event.max_participants > 0
    ? Math.round((event.current_participants / event.max_participants) * 100)
    : 0;
  const startDate = new Date(event.start_date);
  const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/mycabinet/events/${event.id}`}>
      <div className="rounded-2xl border border-foreground/10 overflow-hidden hover:shadow-lg hover:border-foreground/20 transition-all">
        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-foreground/5 overflow-hidden">
          {event.thumbnail_image_url ? (
            <Image
              src={event.thumbnail_image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {event.is_featured && (
              <span className="px-2.5 py-1 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-bold">
                ⭐ Топ
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[event.status] || 'bg-gray-100'}`}>
              {event.status === 'ongoing' ? '🔴 Live' : EVENT_TYPE_LABELS[event.event_type] || event.event_type}
            </span>
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
                -{discount}%
              </span>
            )}
          </div>

          {/* Days until */}
          {daysUntil > 0 && daysUntil <= 3 && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
              {daysUntil === 1 ? 'Завтра' : `${daysUntil} дн`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
            </p>
            <h3 className="text-sm font-bold text-foreground line-clamp-2">
              {event.title}
            </h3>
          </div>

          {/* Description */}
          {event.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {event.short_description}
            </p>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 py-2 border-t border-foreground/5">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {startDate.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {event.is_online ? 'Online' : event.city || event.region}
              </span>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                {event.current_participants}/{event.max_participants}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                {event.ticket_price} {event.currency}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-foreground/10 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(participationPercent, 100)}%` }}
            />
          </div>

          {/* Footer with organizer and button */}
          <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {event.organizer_avatar_url ? (
                <Image
                  src={event.organizer_avatar_url}
                  alt={event.organizer_name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                  {event.organizer_name.charAt(0)}
                </div>
              )}
              <span className="text-xs text-muted-foreground truncate">
                {event.organizer_name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
    } catch (err) {
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Не вдалось завантажити івенти',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.short_description && e.short_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(e => e.region === selectedRegion);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.event_type === selectedType);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedRegion, selectedType, events]);

  const regions = Array.from(new Set(events.map(e => e.region))).sort();
  const types = Array.from(new Set(events.map(e => e.event_type))).sort();

  return (
    <CabinetLayout title="Івенти" showBack showAvatar showNav backHref="/mycabinet">
      <div className="px-4 pt-6 pb-8 space-y-5">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Всі івенти</h1>
          <p className="text-sm text-muted-foreground">
            Знайди цікаві вебінари, конференції та воркшопи
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук івентів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          {/* Region filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Всі регіони</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Всі типи</option>
            {types.map(type => (
              <option key={type} value={type}>{EVENT_TYPE_LABELS[type] || type}</option>
            ))}
          </select>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-foreground/10 overflow-hidden">
                <div className="w-full aspect-[16/9] bg-foreground/5 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-foreground/5 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-foreground/5 rounded animate-pulse" />
                  <div className="h-3 bg-foreground/5 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedRegion !== 'all' || selectedType !== 'all'
                ? 'Івенти не знайдені за вашими критеріями'
                : 'Поки немає доступних івентів'}
            </p>
          </div>
        )}
      </div>
    </CabinetLayout>
  );
}
