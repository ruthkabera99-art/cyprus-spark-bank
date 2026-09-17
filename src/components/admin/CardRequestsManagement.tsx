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
import { CreditCard, Bitcoin, Sparkles, Trash2, Copy, Printer, AlertTriangle, CheckCircle2, Clock3, XCircle, Wifi, WifiOff, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useAdminCardRequests,
  useUpdateCardRequest,
  useDeleteCardRequest,
  type AdminCardRequest,
} from '@/hooks/useCardRequests';
import { useIssuingStatus, useIssueStripeCard, useStripeCardUsage } from '@/hooks/useStripeIssuing';
import { BankCard } from '@/components/cards/BankCard';
import {
  CARD_TYPE_LABELS,
  cardProduct,
  formatCardNumber,
  formatExpiry,
  generateCard,
  isValidCardNumber,
  matchesProgramBin,
  type CardType,
} from '@/lib/cardGenerator';
import { issueUniqueCard, releaseCardNumber } from '@/lib/cardIssuance';


const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  issued: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
};

const TYPES: CardType[] = ['visa', 'mastercard', 'btc'];

type FollowUpStatus = 'all' | 'pending' | 'approved' | 'issued' | 'rejected';
type IssuanceMode = 'live' | 'demo';

const REJECTION_CATEGORIES = {
  misinformation: 'Incorrect or misleading information',
  incomplete_documents: 'Incomplete information or documents',
  identity_verification: 'Identity verification unsuccessful',
  duplicate_request: 'Duplicate card request',
  other: 'Other reason',
} as const;

export function CardRequestsManagement() {
  const { data: requests, isLoading } = useAdminCardRequests();
  const updateRequest = useUpdateCardRequest();
  const deleteRequest = useDeleteCardRequest();

  const [tab, setTab] = useState<'all' | CardType>('all');
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus>('all');
  const [issuing, setIssuing] = useState<AdminCardRequest | null>(null);
  const [rejecting, setRejecting] = useState<AdminCardRequest | null>(null);
  const [rejectionCategory, setRejectionCategory] = useState<keyof typeof REJECTION_CATEGORIES>('misinformation');
  const [rejectionReason, setRejectionReason] = useState('');
  const [term, setTerm] = useState<'3' | '5'>('3');
  const [adminNote, setAdminNote] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof generateCard> | null>(null);
  const [printing, setPrinting] = useState<AdminCardRequest | null>(null);
  const [generating, setGenerating] = useState(false);
  const [issuanceMode, setIssuanceMode] = useState<IssuanceMode>('demo');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('US');
  const [usageCard, setUsageCard] = useState<AdminCardRequest | null>(null);
  const issuingStatus = useIssuingStatus();
  const issueStripeCard = useIssueStripeCard();
  const usage = useStripeCardUsage(usageCard?.issued_reference ?? null);


  const filtered = useMemo(() => {
    if (!requests) return [];
    return requests.filter((request) => {
      const matchesType = tab === 'all' || request.card_type === tab;
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [requests, tab, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: requests?.length ?? 0 };
    TYPES.forEach((t) => {
      map[t] = requests?.filter((r) => r.card_type === t).length ?? 0;
    });
    return map;
  }, [requests]);

  const statusCounts = useMemo(() => ({
    all: requests?.length ?? 0,
    pending: requests?.filter((request) => request.status === 'pending').length ?? 0,
    approved: requests?.filter((request) => request.status === 'approved').length ?? 0,
    issued: requests?.filter((request) => request.status === 'issued').length ?? 0,
    rejected: requests?.filter((request) => request.status === 'rejected').length ?? 0,
  }), [requests]);

  const buildPreview = async (type: CardType, years: 3 | 5, previous?: string | null) => {
    setGenerating(true);
    try {
      releaseCardNumber(previous);
      const card = await issueUniqueCard(type, years);
      setPreview(card);
    } catch (err) {
      setPreview(null);
      toast.error('Could not generate a card number', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const openIssue = (request: AdminCardRequest) => {
    const canIssueLive = Boolean(
      issuingStatus.data?.configured && issuingStatus.data.issuing_enabled && request.card_type !== 'btc',
    );
    setIssuing(request);
    setIssuanceMode(canIssueLive ? 'live' : 'demo');
    setTerm('3');
    setAdminNote(request.admin_note ?? '');
    setPreview(null);
    setBillingCity('');
    setBillingState('');
    setBillingPostalCode('');
    setBillingCountry('US');
    if (!canIssueLive) void buildPreview(request.card_type as CardType, 3);
  };

  const changeIssuanceMode = (mode: IssuanceMode) => {
    if (!issuing) return;
    setIssuanceMode(mode);
    if (mode === 'demo' && !preview) void buildPreview(issuing.card_type as CardType, Number(term) as 3 | 5);
  };

  const regenerate = (years: '3' | '5') => {
    if (!issuing) return;
    setTerm(years);
    void buildPreview(issuing.card_type as CardType, Number(years) as 3 | 5, preview?.card_number);
  };

  const confirmIssue = async () => {
    if (!issuing) return;
    if (issuanceMode === 'live') {
      if (!billingCity.trim() || !billingState.trim() || !billingPostalCode.trim() || billingCountry.trim().length !== 2) {
        toast.error('Complete the cardholder billing address');
        return;
      }
      try {
        const result = await issueStripeCard.mutateAsync({
          request_id: issuing.id,
          admin_note: adminNote.trim() || null,
          billing: {
            city: billingCity.trim(),
            state: billingState.trim(),
            postal_code: billingPostalCode.trim(),
            country: billingCountry.trim().toUpperCase(),
          },
        });
        toast.success(result.existing ? 'Stripe card already issued' : 'Live Stripe card issued', {
          description: `Card ending ${result.last4}`,
        });
        setIssuing(null);
      } catch (err) {
        toast.error('Could not issue live card', {
          description: err instanceof Error ? err.message : 'Please check the Stripe account and customer details.',
        });
      }
      return;
    }

    if (!preview) return;
    if (!isValidCardNumber(preview.card_number) || !matchesProgramBin(issuing.card_type as CardType, preview.card_number)) {
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
      const message = err instanceof Error ? err.message : 'Please try again.';
      const duplicate = /duplicate|unique/i.test(message);
      toast.error(duplicate ? 'That number is already issued' : 'Could not issue card', {
        description: duplicate ? 'Generating a fresh number…' : message,
      });
      if (duplicate) void buildPreview(issuing.card_type as CardType, Number(term) as 3 | 5, preview.card_number);
    }

  };

  const approveRequest = async (request: AdminCardRequest) => {
    try {
      await updateRequest.mutateAsync({
        id: request.id,
        updates: {
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          rejection_category: null,
          rejection_reason: null,
        },
      });
      toast.success('Request approved');
    } catch {
      toast.error('Could not update request');
    }
  };

  const openReject = (request: AdminCardRequest) => {
    setRejecting(request);
    setRejectionCategory('misinformation');
    setRejectionReason('');
  };

  const confirmReject = async () => {
    if (!rejecting) return;
    const reason = rejectionReason.trim();
    if (reason.length < 10) {
      toast.error('Please provide a clear explanation of at least 10 characters');
      return;
    }
    try {
      await updateRequest.mutateAsync({
        id: rejecting.id,
        updates: {
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_category: rejectionCategory,
          rejection_reason: reason,
          admin_note: reason,
        },
      });
      toast.success('Request rejected', { description: 'The rejection reason is now visible to the customer.' });
      setRejecting(null);
      setRejectionReason('');
    } catch {
      toast.error('Could not reject request');
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
          Follow each request from review through approval, rejection, and card issuance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {issuingStatus.isLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : issuingStatus.data?.configured && issuingStatus.data.issuing_enabled ? (
              <Wifi className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <WifiOff className="h-5 w-5 text-destructive" aria-hidden="true" />
            )}
            <div>
              <p className="text-sm font-medium">
                {issuingStatus.data?.configured && issuingStatus.data.issuing_enabled
                  ? `Stripe Issuing connected · ${issuingStatus.data.livemode ? 'Live mode' : 'Test mode'}`
                  : 'Stripe Issuing not connected'}
              </p>
              <p className="text-xs text-muted-foreground">
                {issuingStatus.data?.issuing_error || issuingStatus.data?.reason || 'Live cards use a verified Stripe cardholder account.'}
              </p>
            </div>
          </div>
          {issuingStatus.data?.account_id && (
            <Badge variant="outline">Account {issuingStatus.data.account_id}</Badge>
          )}
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | CardType)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="visa">Visa ({counts.visa})</TabsTrigger>
            <TabsTrigger value="mastercard">Mastercard ({counts.mastercard})</TabsTrigger>
            <TabsTrigger value="btc" className="gap-1">
              <Bitcoin className="h-3.5 w-3.5" /> BTC ({counts.btc})
            </TabsTrigger>
          </TabsList>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Card request status summary">
            {([
              ['all', 'All requests', CreditCard],
              ['pending', 'Pending', Clock3],
              ['approved', 'Approved', CheckCircle2],
              ['issued', 'Issued', Sparkles],
              ['rejected', 'Rejected', XCircle],
            ] as const).map(([value, label, Icon]) => (
              <Button
                key={value}
                type="button"
                variant={statusFilter === value ? 'default' : 'outline'}
                className="h-auto justify-between px-3 py-3"
                onClick={() => setStatusFilter(value)}
              >
                <span className="flex items-center gap-2 text-xs"><Icon className="h-4 w-4" />{label}</span>
                <span className="text-base font-semibold">{statusCounts[value]}</span>
              </Button>
            ))}
          </div>

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
                          <div className="space-y-1">
                            <Badge variant={STATUS_VARIANT[request.status] ?? 'secondary'}>
                              {request.status}
                            </Badge>
                            {request.reviewed_at && (
                              <p className="text-[11px] text-muted-foreground">
                                Reviewed {format(new Date(request.reviewed_at), 'MMM d, yyyy')}
                              </p>
                            )}
                            {request.status === 'rejected' && request.rejection_reason && (
                              <p className="max-w-56 text-xs text-destructive">
                                {request.rejection_category && REJECTION_CATEGORIES[request.rejection_category as keyof typeof REJECTION_CATEGORIES]
                                  ? `${REJECTION_CATEGORIES[request.rejection_category as keyof typeof REJECTION_CATEGORIES]}: `
                                  : ''}
                                {request.rejection_reason}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.issued_reference?.startsWith('ic_') ? (
                            <div>
                              <div className="font-mono text-xs">{request.issued_display_number || `•••• ${request.issued_last_four}`}</div>
                              <div className="text-xs text-muted-foreground">Live Stripe card</div>
                            </div>
                          ) : request.card_number ? (
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
                                onClick={() => approveRequest(request)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReject(request)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'rejected' && (
                            <Button variant="ghost" size="sm" onClick={() => approveRequest(request)}>
                              Reopen & approve
                            </Button>
                          )}
                          {!['rejected', 'cancelled'].includes(request.status) && (
                            <Button size="sm" className="ml-1" onClick={() => openIssue(request)}>
                              <Sparkles className="h-3.5 w-3.5 mr-1" />
                              {request.card_number ? 'Re-issue' : 'Create card'}
                            </Button>
                          )}
                          {request.card_number && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1"
                              onClick={() => setPrinting(request)}
                              aria-label="Print card record"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                          {request.issued_reference?.startsWith('ic_') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1"
                              onClick={() => setUsageCard(request)}
                              aria-label="View card usage history"
                            >
                              <ReceiptText className="h-4 w-4" />
                            </Button>
                          )}
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

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Reject card request
            </DialogTitle>
            <DialogDescription>
              {rejecting ? `Explain why ${rejecting.cardholder_name}'s request cannot be approved.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-category">Reason category</Label>
              <Select value={rejectionCategory} onValueChange={(value) => setRejectionCategory(value as keyof typeof REJECTION_CATEGORIES)}>
                <SelectTrigger id="rejection-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REJECTION_CATEGORIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Explanation shown to customer</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Explain which information is incorrect and what the customer should correct before submitting again."
              />
              <p className="text-xs text-muted-foreground">{rejectionReason.length}/500 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={updateRequest.isPending}>
              {updateRequest.isPending ? 'Rejecting…' : 'Reject request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!issuing} onOpenChange={(open) => !open && setIssuing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue card</DialogTitle>
            <DialogDescription>
              {issuing &&
                `${CARD_TYPE_LABELS[issuing.card_type as CardType]} for ${issuing.cardholder_name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Issuance type">
              <Button
                type="button"
                variant={issuanceMode === 'live' ? 'default' : 'outline'}
                onClick={() => changeIssuanceMode('live')}
                disabled={!issuingStatus.data?.configured || !issuingStatus.data.issuing_enabled || issuing?.card_type === 'btc'}
              >
                Live Stripe card
              </Button>
              <Button
                type="button"
                variant={issuanceMode === 'demo' ? 'default' : 'outline'}
                onClick={() => changeIssuanceMode('demo')}
              >
                Demo card
              </Button>
            </div>

            {issuanceMode === 'live' ? (
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-3">
                  <p className="text-sm font-medium">Real Stripe cardholder account</p>
                  <p className="text-xs text-muted-foreground">The customer name, email, phone, and street address come from their request and profile.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="billing-city">City</Label><Input id="billing-city" value={billingCity} onChange={(event) => setBillingCity(event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="billing-state">State / province</Label><Input id="billing-state" value={billingState} onChange={(event) => setBillingState(event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="billing-postal">Postal code</Label><Input id="billing-postal" value={billingPostalCode} onChange={(event) => setBillingPostalCode(event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="billing-country">Country code</Label><Input id="billing-country" value={billingCountry} maxLength={2} onChange={(event) => setBillingCountry(event.target.value.toUpperCase())} /></div>
                </div>
              </div>
            ) : (
              <div className="border-l-2 border-muted-foreground pl-3">
                <p className="text-sm font-medium">Non-spendable demonstration card</p>
                <p className="text-xs text-muted-foreground">For previews and testing only. It is not connected to a payment network.</p>
              </div>
            )}

            {issuanceMode === 'demo' && (
              <>
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
                <p className="text-xs text-center text-muted-foreground">
                  {cardProduct(preview.card_number) ?? 'Card product'} · unique number, never issued before
                </p>
              </div>
            )}

            {generating && !preview && (
              <p className="text-sm text-center text-muted-foreground">Generating a unique card number…</p>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => regenerate(term)}
              type="button"
              disabled={generating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? 'Generating…' : 'Generate another number'}
            </Button>
              </>
            )}


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
            <Button onClick={confirmIssue} disabled={updateRequest.isPending || issueStripeCard.isPending || (issuanceMode === 'demo' && !preview)}>
              {updateRequest.isPending || issueStripeCard.isPending
                ? 'Issuing…'
                : issuanceMode === 'live'
                  ? 'Issue live Stripe card'
                  : 'Issue demo card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!usageCard} onOpenChange={(open) => !open && setUsageCard(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card usage history</DialogTitle>
            <DialogDescription>
              {usageCard ? `${usageCard.cardholder_name} · card ending ${usageCard.issued_last_four}` : ''}
            </DialogDescription>
          </DialogHeader>
          {usage.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : usage.isError ? (
            <div className="border-l-2 border-destructive pl-3 text-sm text-destructive">
              {usage.error instanceof Error ? usage.error.message : 'Could not load card usage.'}
            </div>
          ) : usage.data?.transactions.length ? (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Merchant</TableHead><TableHead>When</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {usage.data.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell><div className="font-medium">{transaction.merchant_name}</div><div className="text-xs text-muted-foreground">{[transaction.merchant_city, transaction.merchant_country].filter(Boolean).join(', ')}</div></TableCell>
                      <TableCell className="text-xs">{format(new Date(transaction.created * 1000), 'MMM d, yyyy · h:mm a')}</TableCell>
                      <TableCell><Badge variant="outline">{transaction.type}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{new Intl.NumberFormat(undefined, { style: 'currency', currency: transaction.currency.toUpperCase() }).format(Math.abs(transaction.amount) / 100)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">This issued card has no completed usage yet.</p>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setUsageCard(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print / PDF record dialog */}
      <Dialog
        open={!!printing}
        onOpenChange={(open) => {
          if (!open) {
            setPrinting(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="no-print">
            <DialogTitle>Print card</DialogTitle>
            <DialogDescription>
              Front and back are arranged on one clean page with all card details visible.
            </DialogDescription>
          </DialogHeader>

          {printing && (
            <div className="card-print-area">
              <div className="card-print-side">
                <BankCard
                  type={printing.card_type as CardType}
                  number={printing.card_number}
                  holder={printing.cardholder_name}
                  expiryMonth={printing.expiry_month}
                  expiryYear={printing.expiry_year}
                  cvv={printing.cvv}
                  revealed
                />
              </div>
              <div className="card-print-side">
                <BankCard
                  type={printing.card_type as CardType}
                  number={printing.card_number}
                  holder={printing.cardholder_name}
                  expiryMonth={printing.expiry_month}
                  expiryYear={printing.expiry_year}
                  cvv={printing.cvv}
                  revealed
                  flipped
                />
              </div>
            </div>
          )}

          <DialogFooter className="no-print">
            <Button variant="outline" onClick={() => setPrinting(null)}>
              Close
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
