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
    <CabinetLayout 
      title="Евенти"
      showBack={true}
      showAvatar={true}
      showNav={true}
    >
      <div className="space-y-2xl pt-lg">
        <div>
          <h1 className="text-h1 mb-sm">
            События і воркшопи
          </h1>
          <p className="text-body text-secondary">
            Реєструйтеся на наші чудові знакомства та воркшопи
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-md">
          {/* Placeholder events */}
          {[1, 2, 3].map((event) => (
            <div
              key={event}
              className="cabinet-list-item"
            >
              <div className="flex items-start gap-md">
                <div className="flex-shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="cabinet-list-item-title">
                    Событие {event}
                  </h3>
                  <p className="text-small text-muted-foreground mt-sm">
                    Опис события...
                  </p>
                  <div className="mt-md flex items-center justify-between">
                    <p className="text-tiny text-muted-foreground">
                      25 бер, 2025
                    </p>
                    <button className="text-tiny px-sm py-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors">
                      Деталі
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="cabinet-empty-state">
          <p className="cabinet-empty-state-description">
            Жодних доступних подій
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
