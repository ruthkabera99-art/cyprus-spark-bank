import { useState } from 'react';
import { Check, ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Step = {
  id: string;
  label: string;
  question: string;
  options: string[];
};

const STEPS: Step[] = [
  {
    id: 'goal',
    label: 'Goal',
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
    label: 'Amount',
    question: 'Roughly what amount are we talking about?',
    options: ['Under $5,000', '$5,000 – $25,000', '$25,000 – $100,000', 'Over $100,000'],
  },
  {
    id: 'timeline',
    label: 'Timeline',
    question: 'How soon do you need it?',
    options: ['Right away', 'Within a month', 'Just exploring'],
  },
  {
    id: 'profile',
    label: 'Profile',
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
  const [isReviewing, setIsReviewing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = STEPS[stepIndex];
  const answeredCount = STEPS.filter((s) => answers[s.id]).length;
  const progress = isReviewing ? 100 : Math.round((answeredCount / STEPS.length) * 100);

  const handleSelect = (option: string) => {
    const next = { ...answers, [step.id]: option };
    setAnswers(next);

    const firstUnanswered = STEPS.findIndex((s) => !next[s.id]);
    if (firstUnanswered === -1) {
      setIsReviewing(true);
    } else {
      setStepIndex(firstUnanswered);
    }
  };

  const handleSubmit = () => {
    const summary = [
      `Here's my situation:`,
      `• Goal: ${answers.goal}`,
      `• Amount: ${answers.amount}`,
      `• Timeline: ${answers.timeline}`,
      `• Profile: ${answers.profile}`,
      ``,
      `Based on this, what's the best MorganFinance product for me, am I likely eligible, and what are the next steps?`,
    ].join('\n');

    onComplete(summary);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isReviewing
              ? 'Review your answers'
              : `Quick check — step ${stepIndex + 1} of ${STEPS.length}`}
          </p>
          <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
        </div>
      </div>

      {isReviewing ? (
        <>
          <div className="space-y-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setIsReviewing(false);
                  setStepIndex(i);
                }}
                className="w-full flex items-center gap-2 rounded-md border border-border px-3 py-2 text-left hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-sm truncate">{answers[s.id]}</p>
                </div>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={disabled}
            onClick={handleSubmit}
          >
            <Check className="h-4 w-4" />
            Get my recommendation
          </Button>
          <div className="flex justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReviewing(false);
                setStepIndex(STEPS.length - 1);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
              Skip, just chat
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">{step.question}</p>
          <div className="grid gap-2">
            {step.options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={answers[step.id] === option ? 'default' : 'outline'}
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
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-1">
              {answeredCount === STEPS.length && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReviewing(true)}
                >
                  Review
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
                Skip, just chat
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
