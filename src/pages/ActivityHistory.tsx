import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  History,
  FileText,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";

const ActivityHistory = () => {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedTxId = searchParams.get('tx');
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'traditional' | 'crypto'>('all');

  // Scroll to and clear highlight after a few seconds
  useEffect(() => {
    if (!highlightedTxId || !transactions) return;
    const exists = transactions.some((t) => t.id === highlightedTxId);
    if (!exists) return;
    const t = setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    const clear = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete('tx');
      setSearchParams(next, { replace: true });
    }, 6000);
    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, [highlightedTxId, transactions, searchParams, setSearchParams]);

  if (!user) return null;

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch =
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case 'loan_disbursement':
        return <ArrowDownLeft className="h-4 w-4 text-purple-500" />;
      case 'loan_payment':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatAmount = (tx: typeof transactions[0]) => {
    const isIncoming = tx.type === 'deposit' || tx.type === 'loan_disbursement';
    const prefix = isIncoming ? '+' : '-';
    if (tx.category === 'crypto') {
      return `${prefix}${Math.abs(tx.amount)} ${tx.currency}`;
    }
    return `${prefix}$${Math.abs(tx.amount).toLocaleString()}`;
  };

  const stats = {
    total: transactions?.length || 0,
    completed: transactions?.filter(t => t.status === 'completed').length || 0,
    pending: transactions?.filter(t => t.status === 'pending').length || 0,
    deposits: transactions?.filter(t => t.type === 'deposit').length || 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
          </div>
          <p className="text-muted-foreground mb-8">View all your past transactions and account activity</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Total Activities</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Deposits</div>
                <div className="text-2xl font-bold text-blue-600">{stats.deposits}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by description, currency, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="traditional">Traditional</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                    <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                    <SelectItem value="loan_payment">Loan Payments</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => {
                        const isHighlighted = tx.id === highlightedTxId;
                        return (
                        <TableRow
                          key={tx.id}
                          ref={isHighlighted ? highlightedRowRef : undefined}
                          className={isHighlighted ? 'bg-primary/10 ring-2 ring-primary/40 transition-colors' : undefined}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(tx.type)}
                              <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="line-clamp-1">{tx.description || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className={tx.type === 'deposit' || tx.type === 'loan_disbursement' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {formatAmount(tx)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{tx.category}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground">
                              {tx.reference_id || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityHistory;
