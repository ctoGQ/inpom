// Onboarding Questionnaire Component
// Displays 10-question survey during registration flow
// Category: Personal & Business Profiling

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingQuestion {
  id: number;
  question_number: number;
  question_text: string;
  answer_option_1: string;
  answer_option_2: string;
  answer_option_3: string;
  category: string;
}

interface OnboardingQuestionnaireProps {
  customerId: number;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingQuestionnaire({
  customerId,
  onComplete,
  onSkip
}: OnboardingQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch questions from API
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/onboarding/questions');
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const handleAnswer = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion + 1]) {
      toast({
        title: 'Оберіть відповідь',
        description: 'Будь ласка, виберіть один з варіантів відповіді',
        variant: 'destructive'
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all answers are provided
    const missingAnswers = questions
      .map(q => q.question_number)
      .filter(qNum => !answers[qNum]);

    if (missingAnswers.length > 0) {
      toast({
        title: 'Заповніть всі питання',
        description: `Будь ласка, дайте відповідь на всі 10 питань`,
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          answers
        })
      });

      if (!response.ok) throw new Error('Failed to submit responses');

      toast({
        title: 'Дякуємо!',
        description: 'Ваші відповіді успішно збережені'
      });

      onComplete?.();
    } catch (err) {
      toast({
        title: 'Помилка',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="mx-auto flex min-h-[12rem] w-full max-w-2xl items-center justify-center rounded-2xl border-border/60 bg-card p-5 shadow-xl">
        <p className="text-sm font-medium text-muted-foreground">Завантаження питань...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto w-full max-w-2xl rounded-2xl border-destructive/30 bg-card p-5 shadow-md">
        <p className="mb-3 text-sm font-semibold text-destructive">{error}</p>
        <Button onClick={onSkip} variant="outline" size="sm">Пропустити</Button>
      </Card>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <Card className="mx-auto flex h-[min(100dvh-1.5rem,34rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-border/60 bg-card p-4 shadow-xl sm:h-auto sm:min-h-0 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {getCategoryLabel(question.category)}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="w-9 text-right text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      <h1 className="mb-4 text-xl font-bold leading-tight text-foreground sm:text-2xl">
        {question.question_text}
      </h1>

      {/* Answer Options */}
      <RadioGroup
        value={answers[question.question_number] || ''}
        onValueChange={(value) =>
          handleAnswer(question.question_number, value)
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {[
            question.answer_option_1,
            question.answer_option_2,
            question.answer_option_3
          ].map((option, idx) => (
            <div
              key={idx}
              className="flex min-h-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background/50 px-3 py-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5"
              onClick={() => handleAnswer(question.question_number, option)}
            >
              <RadioGroupItem value={option} id={`option-${idx}`} />
              <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-sm font-medium leading-snug text-foreground">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        <Button onClick={handlePrevious} variant="outline" size="sm" disabled={currentQuestion === 0} className="flex-1 sm:flex-none">
          Назад
        </Button>
        <Button onClick={onSkip} variant="ghost" size="sm" className="text-muted-foreground">
          Пропустити
        </Button>
        {isLastQuestion ? (
          <Button onClick={handleSubmit} size="sm" disabled={submitting || Object.keys(answers).length < questions.length} className="flex-1 sm:flex-none">
            {submitting ? 'Надсилання...' : 'Завершити'}
          </Button>
        ) : (
          <Button onClick={handleNext} size="sm" disabled={!answers[question.question_number]} className="flex-1 sm:flex-none">
            Далі
          </Button>
        )}
      </div>

      <p className="pt-2 text-center text-[11px] text-muted-foreground">
        Заповнено {Object.keys(answers).length} з {questions.length}
      </p>
    </Card>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    interests: 'Інтереси',
    motivation: 'Мотивація',
    business: 'Бізнес-цілі',
    personal: 'Особисті цілі',
    vision: 'Бачення'
  };
  return labels[category] || category;
}
