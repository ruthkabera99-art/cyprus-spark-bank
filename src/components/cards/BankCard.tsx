import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCardNumber, formatExpiry, maskCardNumber, type CardType } from '@/lib/cardGenerator';

interface BankCardProps {
  type: CardType;
  number?: string | null;
  holder?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  cvv?: string | null;
  /** Show full number/cvv instead of masked values */
  revealed?: boolean;
  /** Show the back of the card */
  flipped?: boolean;
  /** Allow click / keyboard to flip the card */
  interactive?: boolean;
  className?: string;
}

const CARD_SKIN: Record<CardType, string> = {
  visa: 'card-skin-visa',
  mastercard: 'card-skin-mastercard',
  btc: 'card-skin-btc',
};

const BRAND_NAME: Record<CardType, string> = {
  visa: 'VISA',
  mastercard: 'mastercard',
  btc: 'BTC',
};

function BrandMark({ type }: { type: CardType }) {
  if (type === 'visa') {
    return (
      <span className="font-serif italic font-bold text-2xl tracking-tight text-white drop-shadow-sm">
        VISA
      </span>
    );
  }
  if (type === 'mastercard') {
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-7 w-12">
          <span className="absolute left-0 top-0 h-7 w-7 rounded-full bg-[hsl(var(--brand-mc-red))]" />
          <span className="absolute right-0 top-0 h-7 w-7 rounded-full bg-[hsl(var(--brand-mc-yellow))] mix-blend-hard-light" />
        </div>
        <span className="text-[10px] tracking-wide text-white/90 lowercase">mastercard</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand-btc))] text-[hsl(var(--brand-btc-foreground))] font-bold text-base">
        ₿
      </span>
      <span className="text-[10px] tracking-[0.2em] text-white/90">CRYPTO</span>
    </div>
  );
}

function Chip() {
  return (
    <div className="h-9 w-12 rounded-md card-chip relative overflow-hidden shadow-inner">
      <span className="absolute inset-x-1 top-1/3 h-px bg-black/30" />
      <span className="absolute inset-x-1 top-2/3 h-px bg-black/30" />
      <span className="absolute inset-y-1 left-1/3 w-px bg-black/30" />
      <span className="absolute inset-y-1 left-2/3 w-px bg-black/30" />
      <span className="absolute inset-[30%] rounded-sm border border-black/30" />
    </div>
  );
}

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/80" fill="none" aria-hidden="true">
      {[6, 10, 14].map((r, i) => (
        <path
          key={r}
          d={`M${4 + i * 4} 5 A ${r} ${r} 0 0 1 ${4 + i * 4} 19`}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function BankCard({
  type,
  number,
  holder,
  expiryMonth,
  expiryYear,
  cvv,
  revealed = true,
  flipped = false,
  interactive = false,
  className,
}: BankCardProps) {
  const [selfFlipped, setSelfFlipped] = useState(false);
  const isBack = interactive ? selfFlipped : flipped;

  const displayNumber = number
    ? revealed
      ? formatCardNumber(number)
      : maskCardNumber(number)
    : '•••• •••• •••• ••••';

  return (
    <div
      className={cn('card-perspective w-full max-w-[26rem] select-none', className)}
      onClick={interactive ? () => setSelfFlipped((v) => !v) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelfFlipped((v) => !v);
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? 'Flip card' : undefined}
    >
      <div className={cn('card-flipper aspect-[1.586/1]', isBack && 'is-flipped')}>
        {/* FRONT */}
        <div
          className={cn(
            'card-face rounded-2xl p-5 sm:p-6 flex flex-col justify-between text-white shadow-card-3d',
            CARD_SKIN[type],
          )}
        >
          <div className="card-shine" aria-hidden="true" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">MorganFinance</p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/70">
                {type === 'btc' ? 'Crypto Debit' : 'Debit'}
              </p>
            </div>
            <BrandMark type={type} />
          </div>

          <div className="relative flex items-center gap-3">
            <Chip />
            <ContactlessIcon />
          </div>

          <div className="relative space-y-3">
            <p className="card-number font-mono text-[clamp(1rem,4.6vw,1.4rem)] tracking-[0.12em]">
              {displayNumber}
            </p>
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/60">Card holder</p>
                <p className="font-mono text-xs sm:text-sm uppercase truncate">
                  {holder || 'CARD HOLDER'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/60">Valid thru</p>
                <p className="font-mono text-xs sm:text-sm">
                  {formatExpiry(expiryMonth, expiryYear)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className={cn(
            'card-face card-face-back rounded-2xl flex flex-col text-white shadow-card-3d overflow-hidden',
            CARD_SKIN[type],
          )}
        >
          <div className="h-10 sm:h-12 w-full bg-black/85 mt-5" />
          <div className="px-5 sm:px-6 pt-4 flex items-center gap-3">
            <div className="flex-1 h-8 rounded bg-white/90 flex items-center justify-end pr-2">
              <span className="font-mono text-xs text-black/80 italic">
                {revealed ? cvv || '•••' : '•••'}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">CVV</span>
          </div>
          <div className="px-5 sm:px-6 mt-auto pb-5 flex items-end justify-between">
            <p className="text-[8px] leading-tight text-white/60 max-w-[60%]">
              Authorised signature — not valid unless signed. Issued by MorganFinance Bank.
            </p>
            <span className="text-xs font-semibold tracking-wide text-white/80">
              {BRAND_NAME[type]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
