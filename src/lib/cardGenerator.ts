export type CardType = 'visa' | 'mastercard' | 'btc';

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  visa: 'Visa Card',
  mastercard: 'Mastercard',
  btc: 'BTC Crypto Card',
};

/**
 * Realistic BIN structure.
 *
 * A real card number is not random digits: it is
 *   [ 6-8 digit BIN / IIN ][ individual account number ][ Luhn check digit ]
 * The BIN encodes the network (first digit / MII), the issuer and the product
 * (classic, gold, platinum, business...). We model that here so generated
 * numbers look and validate exactly like production PANs.
 */
interface BinDefinition {
  /** 6-digit issuer identification number (network + issuer + product). */
  bin: string;
  /** Human label for the product tied to this BIN. */
  product: string;
  /** Total PAN length for this network. */
  length: number;
}

const BINS: Record<CardType, BinDefinition[]> = {
  visa: [
    { bin: '453988', product: 'Visa Classic Debit', length: 16 },
    { bin: '455612', product: 'Visa Gold', length: 16 },
    { bin: '491643', product: 'Visa Platinum', length: 16 },
    { bin: '453210', product: 'Visa Business', length: 16 },
  ],
  mastercard: [
    { bin: '521004', product: 'Mastercard Standard', length: 16 },
    { bin: '540621', product: 'Mastercard Gold', length: 16 },
    { bin: '552118', product: 'Mastercard World', length: 16 },
    { bin: '222140', product: 'Mastercard 2-series', length: 16 },
  ],
  btc: [
    { bin: '601128', product: 'BTC Crypto Debit', length: 16 },
    { bin: '622019', product: 'BTC Crypto Platinum', length: 16 },
  ],
};

/** Cryptographically strong random integer in [0, max). */
function secureInt(max: number): number {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    // rejection sampling keeps the distribution uniform
    const limit = Math.floor(0xffffffff / max) * max;
    const buf = new Uint32Array(1);
    let value = limit;
    while (value >= limit) {
      cryptoObj.getRandomValues(buf);
      value = buf[0];
    }
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function secureDigit(): number {
  return secureInt(10);
}

function pick<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
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

/** True when the number starts with one of this program's real BINs. */
export function matchesProgramBin(type: CardType, number: string): boolean {
  const digits = number.replace(/\D/g, '');
  return BINS[type].some((b) => digits.startsWith(b.bin));
}

/** Returns the product name behind a generated number, if known. */
export function cardProduct(number: string | null | undefined): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, '');
  for (const list of Object.values(BINS)) {
    const hit = list.find((b) => digits.startsWith(b.bin));
    if (hit) return hit.product;
  }
  return null;
}

/**
 * Builds one Luhn-valid PAN: BIN + account sequence + check digit.
 * Sequences never start with 0000 so the account block always looks issued.
 */
export function generateCardNumber(type: CardType): string {
  const def = pick(BINS[type]);
  let body = def.bin;
  const accountLength = def.length - def.bin.length - 1;
  body += String(secureInt(9) + 1); // first account digit 1-9
  for (let i = 1; i < accountLength; i++) body += secureDigit();
  return body + luhnCheckDigit(body);
}

/** Generates a CVV (3 digits, 4 for the BTC crypto card program). */
export function generateCvv(type: CardType): string {
  const length = type === 'btc' ? 4 : 3;
  let cvv = '';
  for (let i = 0; i < length; i++) cvv += secureDigit();
  // real CVVs are never all-identical placeholders like 000 / 111
  if (new Set(cvv).size === 1) return generateCvv(type);
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

/**
 * Generates a card whose number has never been issued before.
 * `isTaken` is asked for every candidate; generation retries until a free
 * number is found (the database also enforces a hard uniqueness rule).
 */
export async function generateUniqueCard(
  type: CardType,
  years: 3 | 5,
  isTaken: (cardNumber: string) => boolean | Promise<boolean>,
  maxAttempts = 30,
): Promise<GeneratedCard> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateCard(type, years);
    if (!isValidCardNumber(candidate.card_number)) continue;
    if (await isTaken(candidate.card_number)) continue;
    return candidate;
  }
  throw new Error('Could not generate an unused card number — please try again.');
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
