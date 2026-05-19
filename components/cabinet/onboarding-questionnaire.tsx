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
      <Card className="w-full max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Завантаження питань...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8 border-destructive">
        <p className="text-destructive">{error}</p>
        <Button onClick={onSkip} variant="outline" className="mt-4">
          Пропустити
        </Button>
      </Card>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <Card className="w-full max-w-2xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold mb-2">
          Розпочніть з нас
        </h1>
        <p className="text-sm text-muted-foreground">
          Допоможіть нам краще вас зрозуміти. Це займе близько 5 хвилин.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Питання {currentQuestion + 1} з {questions.length}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category Badge */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
          {getCategoryLabel(question.category)}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold mb-6 leading-tight">
        {question.question_text}
      </h2>

      {/* Answer Options */}
      <RadioGroup
        value={answers[question.question_number] || ''}
        onValueChange={(value) =>
          handleAnswer(question.question_number, value)
        }
      >
        <div className="space-y-3">
          {[
            question.answer_option_1,
            question.answer_option_2,
            question.answer_option_3
          ].map((option, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-4 rounded-lg border border-input hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() =>
                handleAnswer(question.question_number, option)
              }
            >
              <RadioGroupItem
                value={option}
                id={`option-${idx}`}
                className="mt-1"
              />
              <Label
                htmlFor={`option-${idx}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Navigation Buttons */}
      <div className="mt-8 flex gap-3 justify-between">
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentQuestion === 0}
          >
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLastQuestion || !answers[question.question_number]}
          >
            Далі
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-muted-foreground"
          >
            Пропустити
          </Button>
          {isLastQuestion && (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < 10}
              className="min-w-[100px]"
            >
              {submitting ? 'Надсилання...' : 'Завершити'}
            </Button>
          )}
        </div>
      </div>

      {/* Completed Questions Counter */}
      <div className="mt-6 pt-6 border-t text-xs text-muted-foreground text-center">
        Заповнено: {Object.keys(answers).length} / {questions.length}
      </div>
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
