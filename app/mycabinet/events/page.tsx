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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            События і воркшопи
          </h1>
          <p className="text-sm text-gray-700">
            Реєструйтеся на наші чудові знакомства та воркшопи
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {/* Placeholder events */}
          {[1, 2, 3].map((event) => (
            <div
              key={event}
              className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Событие {event}
                  </h3>
                  <p className="text-xs text-gray-700 mt-1">
                    Опис события...
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      25 бер, 2025
                    </p>
                    <button className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium rounded-lg transition-colors">
                      Деталі
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-700">
            Жодних доступних подій
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
