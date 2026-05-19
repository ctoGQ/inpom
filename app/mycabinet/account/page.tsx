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
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Інформація профілю
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                ІМ'Я
              </p>
              <p className="text-sm text-slate-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                EMAIL
              </p>
              <p className="text-sm text-slate-900">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                ID АКАУНТУ
              </p>
              <p className="text-sm text-gray-700 font-mono">
                {customer.id}
              </p>
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <AvatarUpload
            currentAvatarUrl={customer.avatar_url || '/placeholder-user.jpg'}
            customerName={customer.name}
          />
        </div>

        {/* Account Menu */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 px-2">
            Налаштування
          </h3>
          {accountMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block group"
            >
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-gray-600 group-hover:text-blue-600 transition-colors mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Theme Settings */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <ThemeToggle />
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 px-2">
            Небезпечна зона
          </h3>
          <Link href="/auth/signout">
            <Button className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all">
              Вийти
            </Button>
          </Link>
        </div>
      </div>
    </CabinetLayout>
  );
}
