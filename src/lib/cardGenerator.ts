export type CardType = 'visa' | 'mastercard' | 'btc';

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  visa: 'Visa Card',
  mastercard: 'Mastercard',
  btc: 'BTC Crypto Card',
};

// Issuer identification prefixes
const PREFIXES: Record<CardType, string[]> = {
  visa: ['4539', '4556', '4916', '4532', '4929'],
  mastercard: ['5100', '5200', '5300', '5400', '5500', '2221', '2720'],
  // BTC crypto cards on this program are issued on a Mastercard-style BIN range
  btc: ['6011', '6221', '6440'],
};

function randomDigit() {
  return Math.floor(Math.random() * 10);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Luhn check digit for a partial number (without the check digit). */
export function luhnCheckDigit(partial: string): number {
  let sum = 0;
  let double = true; // next digit appended is the check digit, so start doubling from the right
  for (let i = partial.length - 1; i >= 0; i--) {
    let d = Number(partial[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    double = !double;
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/** Validates a card number using the Luhn algorithm. */
export function isValidCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  const body = digits.slice(0, -1);
  return luhnCheckDigit(body) === Number(digits.slice(-1));
}

/** Generates a Luhn-valid 16-digit card number for the given card type. */
export function generateCardNumber(type: CardType): string {
  const prefix = pick(PREFIXES[type]);
  let body = prefix;
  while (body.length < 15) body += randomDigit();
  return body + luhnCheckDigit(body);
}

/** Generates a CVV (3 digits, 4 for the BTC crypto card program). */
export function generateCvv(type: CardType): string {
  const length = type === 'btc' ? 4 : 3;
  let cvv = '';
  for (let i = 0; i < length; i++) cvv += randomDigit();
  return cvv;
}

/** Expiry date N years from today, keeping the current month. */
export function generateExpiry(years: 3 | 5): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() + years };
}

export interface GeneratedCard {
  card_number: string;
  cvv: string;
  expiry_month: number;
  expiry_year: number;
}

export function generateCard(type: CardType, years: 3 | 5): GeneratedCard {
  const { month, year } = generateExpiry(years);
  return {
    card_number: generateCardNumber(type),
    cvv: generateCvv(type),
    expiry_month: month,
    expiry_year: year,
  };
}

export function formatCardNumber(number: string | null | undefined): string {
  if (!number) return '';
  return number.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function maskCardNumber(number: string | null | undefined): string {
  if (!number) return '';
  const digits = number.replace(/\D/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export function formatExpiry(month?: number | null, year?: number | null): string {
  if (!month || !year) return '--/--';
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}
