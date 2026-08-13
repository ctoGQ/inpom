import { TierCard } from '@/components/tier-card';
import Link from 'next/link';
import OpenGoldClient from './OpenGoldClient';

export default function GoldCardPage() {
  const imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-gold-vHG68mRIsgnDlRj8J1tHxKS6QprtDK.png';
  return (
    <main className="min-h-screen py-16 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-display mb-4">Gold картка</h1>
            <p className="text-muted-foreground mb-6">Преміум-рішення для матерів з активним бізнесом — додаткові ресурси, пріоритетна підтримка та персональний ментор.</p>

            <ul className="list-disc pl-5 space-y-2 mb-6 text-sm text-muted-foreground">
              <li>Персональний менеджер та ментор</li>
              <li>Пріоритетні консультації і підтримка</li>
              <li>Доступ до партнерських програм</li>
              <li>Підвищені ліміти і пріоритет обробки</li>
              <li>Ексклюзивні навчальні матеріали</li>
            </ul>

            <div className="flex gap-3">
              <OpenGoldClient />
              <Link href="/mycabinet">
                <button className="py-3 px-6 border border-foreground/20 rounded-lg">Перейти до кабінету</button>
              </Link>
            </div>
          </div>

          <div>
            <div className="w-full max-w-md mx-auto">
              <TierCard variant="gold" imageUrl={imageUrl} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
