'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface BuyerSearchProps {
  onFiltersChange: (filters: BuyerSearchFilters) => void;
  initialFilters?: Partial<BuyerSearchFilters>;
}

const PROPERTY_TYPES = [
  'Single Family Home',
  'Condo',
  'Townhouse',
  'Duplex',
  'Multi-Family',
  'Commercial',
];

const COMMON_AREAS = [
  'Austin',
  'Dallas',
  'Houston',
  'San Antonio',
  'Fort Worth',
  'Plano',
  'Arlington',
  'Corpus Christi',
];

export default function BuyerSearch({ onFiltersChange, initialFilters }: BuyerSearchProps) {
  const [filters, setFilters] = useState<BuyerSearchFilters>({
    searchTerm: '',
    areas: [],
    propertyTypes: [],
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<BuyerSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: BuyerSearchFilters = {
      searchTerm: '',
      areas: [],
      propertyTypes: [],
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleArea = (area: string) => {
    const newAreas = filters.areas.includes(area)
      ? filters.areas.filter(a => a !== area)
      : [...filters.areas, area];
    updateFilters({ areas: newAreas });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    updateFilters({ propertyTypes: newTypes });
  };

  const activeFiltersCount = [
    filters.cashBuyer !== undefined,
    filters.minProofOfFunds !== undefined,
    filters.maxProofOfFunds !== undefined,
    filters.areas.length > 0,
    filters.propertyTypes.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search buyers by name, email, or company..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: 'name' | 'proofOfFunds' | 'createdAt') =>
                    updateFilters({ sortBy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="proofOfFunds">Proof of Funds</SelectItem>
                    <SelectItem value="createdAt">Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') =>
                    updateFilters({ sortOrder: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cash Buyer Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cashBuyer"
                checked={filters.cashBuyer === true}
                onCheckedChange={(checked) =>
                  updateFilters({ cashBuyer: checked ? true : undefined })
                }
              />
              <Label htmlFor="cashBuyer">Cash buyers only</Label>
            </div>

            {/* Proof of Funds Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minProofOfFunds">Min Proof of Funds</Label>
                <Input
                  id="minProofOfFunds"
                  type="number"
                  placeholder="$0"
                  value={filters.minProofOfFunds || ''}
                  onChange={(e) =>
                    updateFilters({
                      minProofOfFunds: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxProofOfFunds">Max Proof of Funds</Label>
                <Input
                  id="maxProofOfFunds"
                  type="number"
                  placeholder="No limit"
                  value={filters.maxProofOfFunds || ''}
                  onChange={(e) =>
                    updateFilters({
                      maxProofOfFunds: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Areas Filter */}
            <div>
              <Label>Preferred Areas</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {COMMON_AREAS.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={filters.areas.includes(area)}
                      onCheckedChange={() => toggleArea(area)}
                    />
                    <Label htmlFor={`area-${area}`} className="text-sm">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Types Filter */}
            <div>
              <Label>Property Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {PROPERTY_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.propertyTypes.includes(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.cashBuyer && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Cash Buyers Only
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ cashBuyer: undefined })}
              />
            </Badge>
          )}
          {filters.minProofOfFunds && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Min: ${filters.minProofOfFunds.toLocaleString()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ minProofOfFunds: undefined })}
              />
            </Badge>
          )}
          {filters.maxProofOfFunds && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Max: ${filters.maxProofOfFunds.toLocaleString()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ maxProofOfFunds: undefined })}
              />
            </Badge>
          )}
          {filters.areas.map((area) => (
            <Badge key={area} variant="secondary" className="flex items-center gap-1">
              {area}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArea(area)}
              />
            </Badge>
          ))}
          {filters.propertyTypes.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => togglePropertyType(type)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}