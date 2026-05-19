import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { Calendar } from 'lucide-react';

export default async function EventsPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  return (
    <CabinetLayout title="Евенти">
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-slate-900 mb-2">
            События і воркшопи
          </h1>
          <p className="text-sm text-muted-foreground">
            Реєструйтеся на наші чудові знакомства та воркшопи
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {/* Placeholder events */}
          {[1, 2, 3].map((event) => (
            <div
              key={event}
              className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-900">
                    Событие {event}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Опис события...
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      25 бер, 2025
                    </p>
                    <button className="text-xs px-3 py-1 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded transition-colors">
                      Деталі
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Жодних доступних подій
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
