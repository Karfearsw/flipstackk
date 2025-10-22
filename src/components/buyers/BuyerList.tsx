'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2, Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/lib/trpc-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import BuyerSearch from './BuyerSearch';

interface BuyerSearchFilters {
  searchTerm: string;
  cashBuyer?: boolean;
  minProofOfFunds?: number;
  maxProofOfFunds?: number;
  areas: string[];
  propertyTypes: string[];
  sortBy: 'name' | 'proofOfFunds' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export default function BuyerList() {
  const router = useRouter();
  const [filters, setFilters] = useState<BuyerSearchFilters>({
    searchTerm: '',
    areas: [],
    propertyTypes: [],
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { data: buyers, isLoading, refetch } = trpc.buyers.getAll.useQuery();
  const deleteBuyer = trpc.buyers.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Filter and sort buyers based on search criteria
  const filteredBuyers = buyers?.filter(buyer => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        buyer.name.toLowerCase().includes(searchLower) ||
        buyer.email?.toLowerCase().includes(searchLower) ||
        buyer.company?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Cash buyer filter
    if (filters.cashBuyer !== undefined && buyer.cashBuyer !== filters.cashBuyer) {
      return false;
    }

    // Proof of funds range filter
    if (filters.minProofOfFunds && (!buyer.proofOfFunds || buyer.proofOfFunds < filters.minProofOfFunds)) {
      return false;
    }
    if (filters.maxProofOfFunds && (!buyer.proofOfFunds || buyer.proofOfFunds > filters.maxProofOfFunds)) {
      return false;
    }

    // Areas filter (check if buyer preferences match any selected areas)
    if (filters.areas.length > 0 && buyer.preferences) {
      const hasMatchingArea = buyer.preferences.some(pref => 
        pref.areas.some(area => filters.areas.includes(area))
      );
      if (!hasMatchingArea) return false;
    }

    // Property types filter
    if (filters.propertyTypes.length > 0 && buyer.preferences) {
      const hasMatchingType = buyer.preferences.some(pref =>
        pref.propertyTypes.some(type => filters.propertyTypes.includes(type))
      );
      if (!hasMatchingType) return false;
    }

    return true;
  })?.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'proofOfFunds':
        comparison = (a.proofOfFunds || 0) - (b.proofOfFunds || 0);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this buyer?')) {
      await deleteBuyer.mutateAsync({ id });
    }
  };

  const handleExport = () => {
    if (!filteredBuyers) return;
    
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Proof of Funds', 'Cash Buyer', 'Created'],
      ...filteredBuyers.map(buyer => [
        buyer.name,
        buyer.email || '',
        buyer.phone || '',
        buyer.company || '',
        buyer.proofOfFunds?.toString() || '',
        buyer.cashBuyer ? 'Yes' : 'No',
        formatDate(buyer.createdAt),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalBuyers = buyers?.length || 0;
  const cashBuyers = buyers?.filter(b => b.cashBuyer).length || 0;
  const avgProofOfFunds = buyers?.length 
    ? buyers.reduce((sum, b) => sum + (b.proofOfFunds || 0), 0) / buyers.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuyers}</div>
            <p className="text-xs text-muted-foreground">
              {filteredBuyers?.length !== totalBuyers && `${filteredBuyers?.length} filtered`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Buyers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashBuyers}</div>
            <p className="text-xs text-muted-foreground">
              {totalBuyers > 0 ? `${Math.round((cashBuyers / totalBuyers) * 100)}% of total` : '0% of total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Proof of Funds</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgProofOfFunds)}</div>
            <p className="text-xs text-muted-foreground">
              Across all buyers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <BuyerSearch onFiltersChange={setFilters} initialFilters={filters} />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Buyers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Buyers ({filteredBuyers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBuyers && filteredBuyers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Proof of Funds</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {buyer.email && (
                          <div className="text-sm">{buyer.email}</div>
                        )}
                        {buyer.phone && (
                          <div className="text-sm text-muted-foreground">{buyer.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{buyer.company || '-'}</TableCell>
                    <TableCell>
                      {buyer.proofOfFunds ? formatCurrency(buyer.proofOfFunds) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={buyer.cashBuyer ? 'default' : 'secondary'}>
                        {buyer.cashBuyer ? 'Cash' : 'Financed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/buyers/${buyer.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(buyer.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filters.searchTerm || filters.areas.length > 0 || filters.propertyTypes.length > 0
                  ? 'No buyers match your search criteria.'
                  : 'No buyers found. Add your first buyer to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}