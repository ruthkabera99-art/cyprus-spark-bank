import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = {
  id: string;
  question: string;
  options: string[];
};

const STEPS: Step[] = [
  {
    id: 'goal',
    question: 'What brings you in today?',
    options: [
      'Borrow money (loan)',
      'Open an account',
      'Send / receive money',
      'Grow savings or crypto',
    ],
  },
  {
    id: 'amount',
    question: 'Roughly what amount are we talking about?',
    options: ['Under $5,000', '$5,000 – $25,000', '$25,000 – $100,000', 'Over $100,000'],
  },
  {
    id: 'timeline',
    question: 'How soon do you need it?',
    options: ['Right away', 'Within a month', 'Just exploring'],
  },
  {
    id: 'profile',
    question: 'Which best describes you?',
    options: ['Personal customer', 'Business owner', 'Crypto holder', 'New to banking'],
  },
];

interface ChatQuestionnaireProps {
  onComplete: (summary: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function ChatQuestionnaire({ onComplete, onSkip, disabled }: ChatQuestionnaireProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = STEPS[stepIndex];

  const handleSelect = (option: string) => {
    const next = { ...answers, [step.id]: option };
    setAnswers(next);

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }

    const summary = [
      `Here's my situation:`,
      `• Goal: ${next.goal}`,
      `• Amount: ${next.amount}`,
      `• Timeline: ${next.timeline}`,
      `• Profile: ${next.profile}`,
      ``,
      `Based on this, what's the best MorganFinance product for me, am I likely eligible, and what are the next steps?`,
    ].join('\n');

    onComplete(summary);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= stepIndex ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Quick check — step {stepIndex + 1} of {STEPS.length}
      </p>
      <p className="text-sm font-medium">{step.question}</p>
      <div className="grid gap-2">
        {step.options.map((option) => (
          <Button
            key={option}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="justify-start h-auto py-2 text-left whitespace-normal"
            onClick={() => handleSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>
      <div className="flex justify-between pt-1">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStepIndex(stepIndex - 1)}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
          Skip, just chat
        </Button>
      </div>
    </div>
  );
}
