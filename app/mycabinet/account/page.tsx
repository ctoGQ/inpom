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
      showBack={true}
      showAvatar={true}
      avatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
      userName={customer.name}
      showNav={true}
    >
      <div className="space-y-space-y-2xl pt-lg">
        {/* Profile Card */}
        <div className="cabinet-card">
          <h2 className="text-h3 mb-lg">
            Інформація профілю
          </h2>
          <div className="space-y-md">
            <div>
              <p className="text-tiny text-muted-foreground mb-sm">
                ІМ'Я
              </p>
              <p className="text-body">{customer.name}</p>
            </div>
            <div>
              <p className="text-tiny text-muted-foreground mb-sm">
                EMAIL
              </p>
              <p className="text-body">{customer.email}</p>
            </div>
            <div>
              <p className="text-tiny text-muted-foreground mb-sm">
                ID АКАУНТУ
              </p>
              <p className="text-caption font-mono">
                {customer.id}
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="cabinet-card">
          <AvatarUpload
            currentAvatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
            customerName={customer.name}
          />
        </div>

        {/* Account Menu */}
        <div className="space-y-md">
          <h3 className="text-small text-foreground px-sm">
            Налаштування
          </h3>
          {accountMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block group"
            >
              <div className="cabinet-list-item">
                <div className="flex items-start gap-md">
                  <div className="text-muted-foreground group-hover:text-primary transition-colors mt-xs">
                    {item.icon}
                  </div>
                  <div>
                    <p className="cabinet-list-item-title">
                      {item.title}
                    </p>
                    <p className="text-small text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Theme Settings */}
        <div className="cabinet-card">
          <ThemeToggle />
        </div>

        {/* Danger Zone */}
        <div className="space-y-md">
          <h3 className="text-small text-foreground px-sm">
            Небезпечна зона
          </h3>
          <Link href="/auth/signout">
            <button className="w-full cabinet-button cabinet-button-destructive">
              Вийти
            </button>
          </Link>
        </div>
      </div>
    </CabinetLayout>
  );
}
