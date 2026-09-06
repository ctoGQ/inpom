// components/onboarding/onboarding-success.tsx
// Success screen after completing all 10 onboarding questions
// Shows celebratory message and next steps

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingSuccessProps {
  customerId: number;
  onComplete?: () => void;
}

export function OnboardingSuccess({
  customerId,
  onComplete
}: OnboardingSuccessProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleContinue = async () => {
    try {
      // Optional: Trigger any post-onboarding actions
      onComplete?.();
      
      // Redirect to dashboard
      router.push('/mycabinet/dashboard');
    } catch (error) {
      console.error('Error continuing:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалось перенаправити',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'inpom - Парламент Жінок',
          text: 'Я щойно вступила до Парламенту Жінок! 🚀',
          url: window.location.origin
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: 'Скопійовано',
          description: 'Посилання скопійовано в буфер обміну'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-muted flex flex-col items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Success icon with animation */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <CheckCircle2 className="w-24 h-24 text-primary relative animate-bounce" />
        </div>

        {/* Main message */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
          Вітаємо! 🎉
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
          Ви успішно завершили анкету та вступили до Парламенту Жінок. Ваш профіль готовий!
        </p>

        {/* Achievement cards */}
        <div className="w-full space-y-3 mb-8">
          <div className="p-4 rounded-xl bg-card border border-input hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Профіль створено</p>
                <p className="text-xs text-muted-foreground">
                  Ваші інтереси та цілі збережені
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-input hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Матчинг активована</p>
                <p className="text-xs text-muted-foreground">
                  Знайдіть однодумців за інтересами
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-input hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Спільнота відкрита</p>
                <p className="text-xs text-muted-foreground">
                  Досліджуйте можливості й подій
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps hint */}
        <div className="w-full p-4 rounded-lg bg-primary/5 border border-primary/20 mb-8">
          <p className="text-sm text-foreground font-medium mb-2">Що далі?</p>
          <ul className="text-xs text-muted-foreground space-y-1 text-left">
            <li>✓ Заповніть профіль фото та контактами</li>
            <li>✓ Розглядайте доступні можливості</li>
            <li>✓ Приєднайтеся до груп за інтересами</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            Перейти до панелі керування
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full px-4 py-3 rounded-lg border border-input hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Надсилання...' : 'Поділитися з подругами'}
          </button>
        </div>

        {/* Footer message */}
        <p className="mt-8 text-xs text-muted-foreground">
          Дякуємо за приєднання до нашої спільноти! 💜
        </p>
      </div>

      {/* Decorative confetti (simple version) */}
      <Confetti />
    </div>
  );
}

// Simple confetti animation component
function Confetti() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="fixed pointer-events-none animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animation: `fall ${2 + Math.random() * 1}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: Math.random() * 0.5 + 0.3
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: [
                '#ff6b6b',
                '#4ecdc4',
                '#ffe66d',
                '#95e1d3',
                '#c7ceea'
              ][Math.floor(Math.random() * 5)]
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
