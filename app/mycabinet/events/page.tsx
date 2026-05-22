import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Бізнес-конференція 2025',
      description: 'Головна конференція для мережевих професіоналів',
      date: '15 черв, 2025',
      time: '09:00 - 18:00',
      location: 'Київ, Палац культури',
      attendees: 234,
      featured: true
    },
    {
      id: 2,
      title: 'Воркшоп: Лідерство',
      description: 'Навчальний семінар про розвиток лідерських навичок',
      date: '20 черв, 2025',
      time: '14:00 - 17:00',
      location: 'Онлайн',
      attendees: 89
    },
    {
      id: 3,
      title: 'Нетворкінг зустріч',
      description: 'Неформальна зустріч професіоналів для обміну досвідом',
      date: '25 черв, 2025',
      time: '18:30 - 20:30',
      location: 'Кафе "BUSINESS HUB"',
      attendees: 45
    }
  ];

  return (
    <CabinetLayout 
      title="События і воркшопи"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="px-4 pt-6 pb-24 space-y-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-semibold text-center">Жодних доступних подій</p>
            <p className="text-muted-foreground text-sm text-center mt-2">Перевірте пізніше</p>
          </div>
        ) : (
          events.map((event) => (
            <Link key={event.id} href={`/mycabinet/events/${event.id}`}>
              <div className="group p-4 rounded-2xl border border-foreground/10 hover:border-primary/50 hover:bg-foreground/5 transition-all cursor-pointer">
                {/* Header with featured badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  </div>
                  {event.featured && (
                    <span className="ml-3 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg whitespace-nowrap">
                      ⭐ Популярно
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div className="space-y-2 my-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{event.date} о {event.time}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{event.attendees} учасників</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-end text-primary group-hover:gap-2 gap-1 transition-all text-sm font-medium pt-3 border-t border-foreground/5">
                  <span>Деталі</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </CabinetLayout>
  );
}
