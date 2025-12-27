import { Suspense } from 'react';
import { getInvoiceList } from '@/lib/actions/invoice';
import InvoiceDataTable from '@/components/invoice/InvoiceDataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Invoices | IDURAR ERP CRM',
  description: 'Manage your invoices',
};

function InvoiceListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/invoice/create">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <Suspense fallback={<InvoiceListSkeleton />}>
        <InvoiceListContent page={page} search={search} />
      </Suspense>
    </div>
  );
}

async function InvoiceListContent({ page, search }: { page: number; search: string }) {
  const invoicesData = await getInvoiceList({ page, search });

  return <InvoiceDataTable initialData={invoicesData} currentPage={page} searchQuery={search} />;
}

