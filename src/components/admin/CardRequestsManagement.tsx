import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { CreditCard, Bitcoin, Sparkles, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useAdminCardRequests,
  useUpdateCardRequest,
  useDeleteCardRequest,
  type AdminCardRequest,
} from '@/hooks/useCardRequests';
import {
  CARD_TYPE_LABELS,
  formatCardNumber,
  formatExpiry,
  generateCard,
  isValidCardNumber,
  type CardType,
} from '@/lib/cardGenerator';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  issued: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
};

const TYPES: CardType[] = ['visa', 'mastercard', 'btc'];

export function CardRequestsManagement() {
  const { data: requests, isLoading } = useAdminCardRequests();
  const updateRequest = useUpdateCardRequest();
  const deleteRequest = useDeleteCardRequest();

  const [tab, setTab] = useState<'all' | CardType>('all');
  const [issuing, setIssuing] = useState<AdminCardRequest | null>(null);
  const [term, setTerm] = useState<'3' | '5'>('3');
  const [adminNote, setAdminNote] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof generateCard> | null>(null);

  const filtered = useMemo(() => {
    if (!requests) return [];
    return tab === 'all' ? requests : requests.filter((r) => r.card_type === tab);
  }, [requests, tab]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: requests?.length ?? 0 };
    TYPES.forEach((t) => {
      map[t] = requests?.filter((r) => r.card_type === t).length ?? 0;
    });
    return map;
  }, [requests]);

  const openIssue = (request: AdminCardRequest) => {
    setIssuing(request);
    setTerm('3');
    setAdminNote(request.admin_note ?? '');
    setPreview(generateCard(request.card_type as CardType, 3));
  };

  const regenerate = (years: '3' | '5') => {
    if (!issuing) return;
    setTerm(years);
    setPreview(generateCard(issuing.card_type as CardType, Number(years) as 3 | 5));
  };

  const confirmIssue = async () => {
    if (!issuing || !preview) return;
    if (!isValidCardNumber(preview.card_number)) {
      toast.error('Generated number failed validation — please regenerate');
      return;
    }
    try {
      await updateRequest.mutateAsync({
        id: issuing.id,
        updates: {
          ...preview,
          status: 'issued',
          issued_at: new Date().toISOString(),
          admin_note: adminNote.trim() || null,
        },
      });
      toast.success('Card issued', {
        description: `${CARD_TYPE_LABELS[issuing.card_type as CardType]} for ${issuing.cardholder_name}`,
      });
      setIssuing(null);
      setPreview(null);
    } catch (err) {
      toast.error('Could not issue card', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const setStatus = async (request: AdminCardRequest, status: 'approved' | 'rejected') => {
    try {
      await updateRequest.mutateAsync({ id: request.id, updates: { status } });
      toast.success(`Request ${status}`);
    } catch {
      toast.error('Could not update request');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteRequest.mutateAsync(id);
      toast.success('Request deleted');
    } catch {
      toast.error('Could not delete request');
    }
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Requests
        </CardTitle>
        <CardDescription>
          Review customer card requests and issue Visa, Mastercard, or BTC cards with generated
          numbers, expiry dates, and CVVs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | CardType)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="visa">Visa ({counts.visa})</TabsTrigger>
            <TabsTrigger value="mastercard">Mastercard ({counts.mastercard})</TabsTrigger>
            <TabsTrigger value="btc" className="gap-1">
              <Bitcoin className="h-3.5 w-3.5" /> BTC ({counts.btc})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No card requests in this category yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Card type</TableHead>
                      <TableHead>Name on card</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Card details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">
                            {request.profile?.full_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {request.profile?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5">
                            {request.card_type === 'btc' ? (
                              <Bitcoin className="h-4 w-4" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            {CARD_TYPE_LABELS[request.card_type as CardType]}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {request.cardholder_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.card_number ? (
                            <button
                              type="button"
                              onClick={() => copy(request.card_number!)}
                              className="text-left group"
                            >
                              <div className="font-mono text-xs flex items-center gap-1">
                                {formatCardNumber(request.card_number)}
                                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                exp {formatExpiry(request.expiry_month, request.expiry_year)} · cvv{' '}
                                {request.cvv}
                              </div>
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not issued</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatus(request, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatus(request, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" className="ml-1" onClick={() => openIssue(request)}>
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            {request.card_number ? 'Re-issue' : 'Create card'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1"
                            onClick={() => remove(request.id)}
                            aria-label="Delete request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={!!issuing} onOpenChange={(open) => !open && setIssuing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create card</DialogTitle>
            <DialogDescription>
              {issuing &&
                `${CARD_TYPE_LABELS[issuing.card_type as CardType]} for ${issuing.cardholder_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Validity</Label>
              <Select value={term} onValueChange={(v) => regenerate(v as '3' | '5')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="5">5 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {preview && issuing && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <BankCard
                    type={issuing.card_type as CardType}
                    number={preview.card_number}
                    holder={issuing.cardholder_name}
                    expiryMonth={preview.expiry_month}
                    expiryYear={preview.expiry_year}
                    cvv={preview.cvv}
                    interactive
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Tap the card to flip and check the CVV ({preview.cvv}).
                </p>
              </div>
            )}


            <Button
              variant="outline"
              className="w-full"
              onClick={() => regenerate(term)}
              type="button"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Generate another number
            </Button>

            <div className="space-y-2">
              <Label htmlFor="admin-note">Note to customer (optional)</Label>
              <Textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Your card is active and ready to use."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIssuing(null)}>
              Cancel
            </Button>
            <Button onClick={confirmIssue} disabled={updateRequest.isPending}>
              {updateRequest.isPending ? 'Issuing…' : 'Issue card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
