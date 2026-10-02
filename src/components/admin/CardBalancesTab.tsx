import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Wallet, WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useIssuingStatus,
  useIssuingBalances,
  useSetCardSpendingLimit,
  useIssuingCharges,
  type CardBalance,
} from '@/hooks/useStripeIssuing';

type Interval = 'per_authorization' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';

const INTERVALS: { value: Interval; label: string }[] = [
  { value: 'all_time', label: 'Total (all time)' },
  { value: 'monthly', label: 'Each month' },
  { value: 'weekly', label: 'Each week' },
  { value: 'daily', label: 'Each day' },
  { value: 'yearly', label: 'Each year' },
  { value: 'per_authorization', label: 'Per purchase' },
];

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

export function CardBalancesTab() {
  const status = useIssuingStatus();
  const connected = Boolean(status.data?.configured);
  const balances = useIssuingBalances(connected);
  const charges = useIssuingCharges(connected);
  const setLimit = useSetCardSpendingLimit();

  const [editing, setEditing] = useState<CardBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState<Interval>('monthly');

  const openEdit = (card: CardBalance) => {
    setEditing(card);
    setAmount(card.spending_limit !== null ? String(card.spending_limit / 100) : '');
    setInterval((card.spending_interval as Interval) ?? 'monthly');
  };

  const saveLimit = async () => {
    if (!editing) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await setLimit.mutateAsync({ card_id: editing.card_id, amount: Math.round(value * 100), interval });
      toast.success('Card funding limit updated');
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update the limit');
    }
  };

  if (status.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-muted-foreground" />
            Card balances unavailable
          </CardTitle>
          <CardDescription>
            {status.data?.reason ?? 'Connect your card issuing account to see how much each card has left.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const funding = balances.data?.issuing_balance ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Funding balance
            </CardTitle>
            <CardDescription>Money available to cover spending on all issued cards.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => balances.refetch()} disabled={balances.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${balances.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {balances.isLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : funding.length ? (
            <div className="flex flex-wrap gap-6">
              {funding.map((entry) => (
                <div key={entry.currency}>
                  <p className="text-3xl font-bold">{money(entry.amount, entry.currency)}</p>
                  <p className="text-xs uppercase text-muted-foreground">{entry.currency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No funding balance reported yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issued card balances</CardTitle>
          <CardDescription>How much each issued card has left before it stops working.</CardDescription>
        </CardHeader>
        <CardContent>
          {balances.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : balances.isError ? (
            <p className="flex items-center gap-2 py-8 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {balances.error instanceof Error ? balances.error.message : 'Could not load card balances.'}
            </p>
          ) : balances.data?.cards.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cardholder</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Left</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.data.cards.map((card) => (
                    <TableRow key={card.card_id}>
                      <TableCell>
                        <div className="font-medium">{card.cardholder_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{card.status}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">•••• {card.last_four ?? '????'}</TableCell>
                      <TableCell className="text-right">
                        {card.spending_limit === null ? (
                          <Badge variant="outline">No limit</Badge>
                        ) : (
                          <div>
                            <div className="font-mono">{money(card.spending_limit, card.currency)}</div>
                            <div className="text-xs text-muted-foreground">
                              {INTERVALS.find((i) => i.value === card.spending_interval)?.label ?? card.spending_interval}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">{money(card.spent, card.currency)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {card.error
                          ? '—'
                          : card.remaining === null
                            ? 'Unlimited'
                            : money(card.remaining, card.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openEdit(card)} disabled={!!card.error}>
                          Fund
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No live issued cards yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card charges log</CardTitle>
          <CardDescription>Every real purchase or refund made on an issued card.</CardDescription>
        </CardHeader>
        <CardContent>
          {charges.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : charges.isError ? (
            <p className="flex items-center gap-2 py-8 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {charges.error instanceof Error ? charges.error.message : 'Could not load charges.'}
            </p>
          ) : charges.data?.charges.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Cardholder</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.data.charges.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm">{new Date(c.created * 1000).toLocaleString()}</TableCell>
                      <TableCell>{c.cardholder_name}</TableCell>
                      <TableCell className="font-mono text-sm">•••• {c.last_four ?? '????'}</TableCell>
                      <TableCell>
                        <div>{c.merchant_name}</div>
                        {c.merchant_city && <div className="text-xs text-muted-foreground">{c.merchant_city}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{c.type}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{money(Math.abs(c.amount), c.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No charges on issued cards yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund this card</DialogTitle>
            <DialogDescription>
              {editing ? `${editing.cardholder_name} · card ending ${editing.last_four ?? '????'}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-limit-amount">Amount the card can spend</Label>
              <Input
                id="card-limit-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500.00"
              />
            </div>
            <div className="space-y-2">
              <Label>How often it resets</Label>
              <Select value={interval} onValueChange={(value) => setInterval(value as Interval)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveLimit} disabled={setLimit.isPending}>
              {setLimit.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
