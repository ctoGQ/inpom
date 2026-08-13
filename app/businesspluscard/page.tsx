import { TierCard } from '@/components/tier-card';
import Link from 'next/link';
import OpenBusinessClient from './OpenBusinessClient';

export default function BusinessPlusCardPage() {
  const imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-business-LSbBGlxtQ42dQC1ZITco7TuzkE9BMw.png';
  return (
    <main className="min-h-screen py-16 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-display mb-4">Business Plus картка</h1>
            <p className="text-muted-foreground mb-6">Рішення для команд та організацій з високими вимогами: виділені ресурси, SLA та розширена безпека.</p>

            <ul className="list-disc pl-5 space-y-2 mb-6 text-sm text-muted-foreground">
              <li>Невмежені консультації та пріоритетні завдання</li>
              <li>Виділені ресурси та інфраструктура</li>
              <li>Гарантований SLA та підтримка 24/7</li>
              <li>Розширені питання безпеки та відповідності</li>
              <li>Індивідуальна інтеграція та налаштування</li>
            </ul>

            <div className="flex gap-3">
              <OpenBusinessClient />
              <Link href="/mycabinet">
                <button className="py-3 px-6 border border-foreground/20 rounded-lg">Перейти до кабінету</button>
              </Link>
            </div>
          </div>

          <div>
            <div className="w-full max-w-md mx-auto">
              <TierCard variant="business" imageUrl={imageUrl} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
