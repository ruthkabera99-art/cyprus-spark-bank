import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Bitcoin, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import {
  useMyCardRequests,
  useCreateCardRequest,
  useCancelCardRequest,
  type CardTypeEnum,
} from '@/hooks/useCardRequests';
import {
  CARD_TYPE_LABELS,
  formatCardNumber,
  formatExpiry,
  maskCardNumber,
  type CardType,
} from '@/lib/cardGenerator';

const CARD_OPTIONS: { type: CardType; title: string; blurb: string; gradient: string }[] = [
  {
    type: 'visa',
    title: 'Visa Debit',
    blurb: 'Accepted in 200+ countries, zero foreign transaction fees.',
    gradient: 'from-primary to-primary/60',
  },
  {
    type: 'mastercard',
    title: 'Mastercard',
    blurb: 'Worldwide acceptance with premium purchase protection.',
    gradient: 'from-accent to-accent/60',
  },
  {
    type: 'btc',
    title: 'BTC Crypto Card',
    blurb: 'Spend your Bitcoin balance anywhere cards are accepted.',
    gradient: 'from-secondary to-secondary/60',
  },
];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  issued: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
};

export default function CardRequestPage() {
  const { data: profile } = useProfile();
  const { data: requests, isLoading } = useMyCardRequests();
  const createRequest = useCreateCardRequest();
  const cancelRequest = useCancelCardRequest();

  const [cardType, setCardType] = useState<CardType>('visa');
  const [cardholderName, setCardholderName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const name = cardholderName || profile?.full_name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      toast.error('Please enter the full name to print on the card');
      return;
    }
    try {
      await createRequest.mutateAsync({
        card_type: cardType as CardTypeEnum,
        cardholder_name: name.trim().toUpperCase(),
        delivery_address: address.trim() || profile?.address || null,
        phone: phone.trim() || profile?.phone || null,
      });
      toast.success('Card request submitted', {
        description: 'Our team will review and issue your card shortly.',
      });
      setCardholderName('');
      setAddress('');
      setPhone('');
    } catch (err) {
      toast.error('Could not submit request', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest.mutateAsync(id);
      toast.success('Request cancelled');
    } catch {
      toast.error('Could not cancel this request');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Request a Bank Card | MorganFinance Bank"
        description="Request a Visa, Mastercard, or BTC crypto card from MorganFinance Bank and track your card issuance status."
        noindex
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Request a Card</h1>
          <p className="text-muted-foreground mt-1">
            Choose your card type — our team issues it after a quick review.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New card request</CardTitle>
            <CardDescription>Select a card and confirm your delivery details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {CARD_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setCardType(option.type)}
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all',
                      cardType === option.type
                        ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-primary-foreground mb-3',
                        option.gradient,
                      )}
                    >
                      {option.type === 'btc' ? (
                        <Bitcoin className="w-6 h-6" />
                      ) : (
                        <CreditCard className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{option.blurb}</p>
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholder">Name on card</Label>
                  <Input
                    id="cardholder"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder={profile?.full_name || 'JOHN DOE'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={profile?.phone || '+1 555 000 0000'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Delivery address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={profile?.address || 'Street, city, postal code, country'}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? 'Submitting…' : `Request ${CARD_TYPE_LABELS[cardType]}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My cards & requests</CardTitle>
            <CardDescription>Track status and view issued card details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <Skeleton className="h-24 w-full" />}
            {!isLoading && (requests?.length ?? 0) === 0 && (
              <p className="text-muted-foreground text-sm">You have no card requests yet.</p>
            )}
            {requests?.map((request) => {
              const isIssued = !!request.card_number;
              const show = revealed[request.id];
              return (
                <div key={request.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {request.card_type === 'btc' ? (
                        <Bitcoin className="w-5 h-5 text-primary" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {CARD_TYPE_LABELS[request.card_type as CardType]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.cardholder_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>
                        {request.status}
                      </Badge>
                      {request.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancel(request.id)}
                          aria-label="Cancel request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isIssued && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg tracking-wider text-foreground">
                          {show ? formatCardNumber(request.card_number) : maskCardNumber(request.card_number)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setRevealed((prev) => ({ ...prev, [request.id]: !prev[request.id] }))
                          }
                          aria-label={show ? 'Hide card number' : 'Show card number'}
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>
                          Expires{' '}
                          <span className="text-foreground font-medium">
                            {formatExpiry(request.expiry_month, request.expiry_year)}
                          </span>
                        </span>
                        <span>
                          CVV{' '}
                          <span className="text-foreground font-medium font-mono">
                            {show ? request.cvv : '•••'}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                  {request.admin_note && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Note from bank: {request.admin_note}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
