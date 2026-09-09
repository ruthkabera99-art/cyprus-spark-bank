import { supabase } from '@/integrations/supabase/client';
import { generateUniqueCard, type CardType, type GeneratedCard } from '@/lib/cardGenerator';

/** Numbers handed out during this session but not yet saved. */
const reserved = new Set<string>();

async function existsInDatabase(cardNumber: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('card_requests')
    .select('id')
    .eq('card_number', cardNumber)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/**
 * Produces a realistic, Luhn-valid card number that has never been issued
 * before: checked against every stored card and against numbers already
 * previewed in this session.
 */
export async function issueUniqueCard(type: CardType, years: 3 | 5): Promise<GeneratedCard> {
  const card = await generateUniqueCard(type, years, async (candidate) => {
    if (reserved.has(candidate)) return true;
    return existsInDatabase(candidate);
  });
  reserved.add(card.card_number);
  return card;
}

/** Releases a previewed number that ended up unused. */
export function releaseCardNumber(cardNumber?: string | null) {
  if (cardNumber) reserved.delete(cardNumber);
}
