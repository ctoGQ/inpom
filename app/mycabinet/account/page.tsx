import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';
import { AvatarUpload } from '@/components/cabinet/avatar-upload';
import { ThemeToggle } from '@/components/cabinet/theme-toggle';
import Link from 'next/link';
import { ChevronRight, Mail, Lock, Smartphone, LogOut, Copy } from 'lucide-react';

export default async function AccountPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  const accountMenuItems = [
    {
      title: 'Редагувати профіль',
      description: 'Ім\'я та контактні дані',
      icon: Mail,
      href: '/mycabinet/account/edit',
    },
    {
      title: 'Пароль',
      description: 'Змінити пароль',
      icon: Lock,
      href: '/mycabinet/account/password',
    },
    {
      title: 'PIN-код',
      description: 'Встановити або змінити PIN-код',
      icon: Smartphone,
      href: '/mycabinet/account/pincode',
    },
  ];

  return (
    <CabinetLayout
      title="Акаунт"
      showBack={true}
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <div className="px-4 pt-6 pb-24 space-y-6">
        {/* Profile Information */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Інформація профілю
          </p>
          <div className="p-4 rounded-2xl border border-foreground/10 bg-foreground/5 space-y-4">
            {/* Name */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ім'я</p>
              <p className="text-base font-semibold text-foreground">{customer.name}</p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-base font-semibold text-foreground">{customer.email}</p>
            </div>

            {/* Account ID */}
            <div className="pt-2 border-t border-foreground/10">
              <p className="text-xs text-muted-foreground mb-2">ID Акаунту</p>
              <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
                <code className="text-xs font-mono text-foreground">{customer.id}</code>
                <button className="p-2 hover:bg-foreground/10 rounded-lg transition-all">
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <AvatarUpload
          currentAvatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
          customerName={customer.name}
        />

        {/* Settings Section */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Налаштування
          </p>
          <div className="space-y-2">
            {accountMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block group"
                >
                  <div className="p-4 rounded-2xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 hover:border-primary/50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-foreground/10 group-hover:bg-foreground/20 transition-all">
                        <IconComponent className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Theme Settings */}
        <ThemeToggle />

        {/* Danger Zone */}
        <div className="space-y-3 pt-4">
          <p className="text-xs font-semibold text-destructive/80 uppercase tracking-wide">
            Небезпечна зона
          </p>
          <Link href="/auth/signout" className="block">
            <button className="w-full px-6 py-4 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-2xl border border-destructive/20 transition-all flex items-center justify-center gap-2 active:scale-95">
              <LogOut className="w-5 h-5" />
              Вийти з акаунту
            </button>
          </Link>
        </div>
      </div>
    </CabinetLayout>
  );
}
