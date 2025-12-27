'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyWithSymbol, formatDate } from '@/lib/utils/format';
import { FileText, Receipt, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardData {
  invoices: any[];
  payments: any[];
  quotes: any[];
  summary: {
    totalInvoices?: number;
    totalRevenue?: number;
    totalPending?: number;
    totalPaid?: number;
  };
}

export default function DashboardModule({ initialData }: { initialData: DashboardData }) {
  const { invoices, payments, quotes, summary } = initialData;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrencyWithSymbol(summary.totalRevenue || 0, 'USD'),
      description: 'All time revenue',
      icon: TrendingUp,
      trend: '+12.5%',
    },
    {
      title: 'Total Invoices',
      value: summary.totalInvoices || 0,
      description: 'Active invoices',
      icon: FileText,
    },
    {
      title: 'Pending Payments',
      value: formatCurrencyWithSymbol(summary.totalPending || 0, 'USD'),
      description: 'Awaiting payment',
      icon: DollarSign,
    },
    {
      title: 'Total Paid',
      value: formatCurrencyWithSymbol(summary.totalPaid || 0, 'USD'),
      description: 'Completed payments',
      icon: Receipt,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoice activity</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/invoice">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.client?.name || '-'}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatCurrencyWithSymbol(invoice.total, invoice.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No invoices yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Quotes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Quotes</CardTitle>
                <CardDescription>Latest quote activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/quote">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{quote.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {quote.client?.name || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrencyWithSymbol(quote.total, quote.currency)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No quotes yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/payment">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">#{payment.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.client?.name || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrencyWithSymbol(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

