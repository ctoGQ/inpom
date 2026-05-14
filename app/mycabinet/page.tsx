import { redirect } from 'next/navigation';
import { getSessionCustomer, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Mail, Calendar, Settings } from 'lucide-react';

export default async function MyCABINETPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const createdDate = new Date(customer.created_at).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-display text-foreground">MOTHERS</span>
            <span className="text-xs text-muted-foreground font-mono">TM</span>
          </a>

          <form action={async () => {
            'use server';
            await logout();
            redirect('/');
          }}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Вихід
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        {/* Profile Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-display text-foreground mb-2">
                Особистий кабінет
              </h1>
              <p className="text-muted-foreground">
                Керуйте своїм профілем та налаштуваннями
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center">
                <User className="w-10 h-10 text-foreground/50" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display text-foreground mb-1">
                  {customer.name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </p>
              </div>
              <Button
                className="bg-foreground hover:bg-foreground/90 text-background rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Редагувати профіль
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-foreground/10">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Рівень члена</p>
                <p className="text-lg font-medium text-foreground">
                  {customer.level_id ? 'Активний' : 'Базовий'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Дата реєстрації</p>
                <p className="text-lg font-medium text-foreground">{createdDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Статус</p>
                <p className="text-lg font-medium text-foreground">
                  {customer.is_active ? '✓ Активний' : '○ Неактивний'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orders Section */}
          <div className="border border-foreground/10 rounded-xl p-8">
            <h3 className="text-xl font-display text-foreground mb-4">
              Мої замовлення
            </h3>
            <p className="text-muted-foreground mb-6">
              Переглядайте та керуйте своїми замовленнями
            </p>
            <Button
              variant="outline"
              className="w-full border-foreground/20 hover:bg-foreground/5"
            >
              Переглянути замовлення
            </Button>
          </div>

          {/* Subscriptions Section */}
          <div className="border border-foreground/10 rounded-xl p-8">
            <h3 className="text-xl font-display text-foreground mb-4">
              Передплати
            </h3>
            <p className="text-muted-foreground mb-6">
              Управляйте вашими передплатами на блог та матеріали
            </p>
            <Button
              variant="outline"
              className="w-full border-foreground/20 hover:bg-foreground/5"
            >
              Мої передплати
            </Button>
          </div>

          {/* Support Tickets */}
          <div className="border border-foreground/10 rounded-xl p-8">
            <h3 className="text-xl font-display text-foreground mb-4">
              Запитання та запити
            </h3>
            <p className="text-muted-foreground mb-6">
              Створюйте та переглядайте ваші запити до служби підтримки
            </p>
            <Button
              variant="outline"
              className="w-full border-foreground/20 hover:bg-foreground/5"
            >
              Мої запити
            </Button>
          </div>

          {/* Settings */}
          <div className="border border-foreground/10 rounded-xl p-8">
            <h3 className="text-xl font-display text-foreground mb-4">
              Налаштування
            </h3>
            <p className="text-muted-foreground mb-6">
              Змініть пароль, адресу та інші налаштування
            </p>
            <Button
              variant="outline"
              className="w-full border-foreground/20 hover:bg-foreground/5"
            >
              До налаштувань
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 pt-12 border-t border-foreground/10">
          <h3 className="text-2xl font-display text-foreground mb-8">
            Ваша статистика
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Активних замовлень', value: '0' },
              { label: 'Завершених замовлень', value: '0' },
              { label: 'Загальна витрачена сума', value: '₴0.00' },
              { label: 'Накопиченої балів', value: '0' },
            ].map((stat) => (
              <div key={stat.label} className="bg-foreground/5 rounded-lg p-6 border border-foreground/10">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-display text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 mt-20 py-12 bg-foreground/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 MOTHERS Parliament Ukraine. Усі права захищені.
          </p>
        </div>
      </footer>
    </div>
  );
}
