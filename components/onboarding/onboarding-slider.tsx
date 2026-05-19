// components/onboarding/onboarding-slider.tsx
// Mobile-first slider for 10-question onboarding survey
// Swipe between questions, tap to answer, automatic progression

'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { OnboardingSuccess } from './onboarding-success';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: number;
  question_number: number;
  question_text: string;
  answer_option_1: string;
  answer_option_2: string;
  answer_option_3: string;
  category: string;
}

interface OnboardingSliderProps {
  customerId: number;
  onComplete?: () => void;
}

export function OnboardingSlider({
  customerId,
  onComplete
}: OnboardingSliderProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0-9 for questions, 10 for success
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/onboarding/questions');
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentStep < 10) {
      // Swipe left - next question (only if current question answered)
      if (answers[currentStep + 1]) {
        setCurrentStep(currentStep + 1);
      }
    }

    if (isRightSwipe && currentStep > 0) {
      // Swipe right - previous question
      setCurrentStep(currentStep - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleAnswerSelect = async (answer: string) => {
    const questionNumber = currentStep + 1;

    // Save answer to state
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));

    // Auto-advance to next question after selection
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === questions.length - 1) {
        // All questions answered, go to success screen
        handleSubmit({ ...answers, [questionNumber]: answer });
      }
    }, 300);
  };

  const handleSubmit = async (finalAnswers: Record<number, string>) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          answers: finalAnswers
        })
      });

      if (!response.ok) throw new Error('Failed to submit responses');

      // Move to success screen
      setCurrentStep(10);

      toast({
        title: 'Дякуємо!',
        description: 'Ваш профіль успішно створений'
      });
    } catch (err) {
      console.error('Error submitting:', err);
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (currentStep === 10) {
    return (
      <OnboardingSuccess
        customerId={customerId}
        onComplete={onComplete}
      />
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentStep];
  const categoryColor = getCategoryColor(question.category);
  const categoryLabel = getCategoryLabel(question.category);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background to-muted overflow-hidden">
      {/* Header with progress */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2 bg-gradient-to-b from-background to-transparent">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-medium text-muted-foreground">
            {currentStep + 1} / {questions.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: questions.length }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i <= currentStep
                    ? 'bg-primary w-3'
                    : 'bg-muted w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category badge */}
        <div className="flex gap-2 items-center">
          <div
            className={`w-2 h-2 rounded-full ${categoryColor}`}
          />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Slider container */}
      <div
        ref={sliderRef}
        className="fixed inset-0 top-24 flex touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide content */}
        <div className="w-full flex-shrink-0 flex flex-col px-4 py-6 justify-between">
          {/* Question */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-8">
              {question.question_text}
            </h2>

            {/* Answer options */}
            <div className="space-y-3">
              {[
                question.answer_option_1,
                question.answer_option_2,
                question.answer_option_3
              ].map((option, idx) => {
                const isSelected = answers[question.question_number] === option;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={submitting}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-input bg-card hover:border-primary/50 hover:bg-muted/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer hint */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            {currentStep === questions.length - 1 ? (
              <p>Натисніть на відповідь, щоб завершити</p>
            ) : (
              <p>Натисніть на відповідь, щоб продовжити</p>
            )}
          </div>

          {/* Swipe hint (show on first question) */}
          {currentStep === 0 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                <span>Або проведіть</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation (optional, for keyboard users) */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-background to-transparent">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm rounded-lg border border-input disabled:opacity-30 hover:bg-muted transition-colors"
          >
            Назад
          </button>
          {answers[question.question_number] && (
            <button
              onClick={() => {
                if (currentStep < questions.length - 1) {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              Далі
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    interests: 'bg-blue-500',
    motivation: 'bg-purple-500',
    business: 'bg-green-500',
    personal: 'bg-pink-500',
    vision: 'bg-orange-500'
  };
  return colors[category] || 'bg-gray-500';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    interests: 'Інтереси',
    motivation: 'Мотивація',
    business: 'Бізнес',
    personal: 'Особисте',
    vision: 'Бачення'
  };
  return labels[category] || category;
}
