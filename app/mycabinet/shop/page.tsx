import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import { CabinetLayout } from '@/components/cabinet/cabinet-layout';

export default async function ShopPage() {
  const customer = await getSessionCustomer();

  if (!customer) {
    redirect('/auth/signin');
  }

  return (
    <CabinetLayout title="Магазин">
      <div className="space-y-6 pt-6">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-2">
            Магазин
          </h1>
          <p className="text-sm text-muted-foreground">
            Придбайте матеріали та послуги
          </p>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Placeholder items */}
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-4 bg-foreground/5 border border-foreground/10 rounded-lg"
            >
              <div className="w-full aspect-square bg-foreground/10 rounded-lg mb-3" />
              <p className="text-sm font-medium text-foreground">
                Товар {item}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Опис товару
              </p>
              <p className="text-sm font-medium text-foreground mt-3">
                100.00 inpom
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Товари поки недоступні
          </p>
        </div>
      </div>
    </CabinetLayout>
  );
}
