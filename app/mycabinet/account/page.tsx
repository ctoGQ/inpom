import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AvatarUpload } from '@/components/cabinet/avatar-upload';
import { ThemeToggle } from '@/components/cabinet/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Mail, Lock, Smartphone } from 'lucide-react';

export default async function AccountPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const accountMenuItems = [
    {
      title: 'Редагувати профіль',
      description: 'Ім\'я та контактні дані',
      icon: <Mail className="w-5 h-5" />,
      href: '/mycabinet/account/edit',
    },
    {
      title: 'Пароль',
      description: 'Змінити пароль',
      icon: <Lock className="w-5 h-5" />,
      href: '/mycabinet/account/password',
    },
    {
      title: 'PIN-код',
      description: 'Встановити або змінити PIN-код',
      icon: <Smartphone className="w-5 h-5" />,
      href: '/mycabinet/account/pincode',
    },
  ];

  return (
    <CabinetLayout
      title="Акаунт"
      showAvatar={false}
    >
      <div className="space-y-6 pt-6">
        {/* Profile Card */}
        <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
          <h2 className="text-lg font-display text-slate-900 mb-4">
            Інформація профілю
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                ІМ'Я
              </p>
              <p className="text-sm text-foreground">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                EMAIL
              </p>
              <p className="text-sm text-foreground">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                ID АКАУНТУ
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {customer.id}
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
          <AvatarUpload
            currentAvatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
            customerName={customer.name}
          />
        </div>

        {/* Account Menu */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground px-2">
            Налаштування
          </h3>
          {accountMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block group"
            >
              <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-lg hover:bg-foreground/10 hover:border-foreground/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Theme Settings */}
        <div className="p-6 bg-foreground/5 border border-foreground/10 rounded-lg">
          <ThemeToggle />
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground px-2">
            Небезпечна зона
          </h3>
          <Link href="/auth/signout">
            <Button variant="destructive" className="w-full">
              Вийти
            </Button>
          </Link>
        </div>
      </div>
    </CabinetLayout>
  );
}
