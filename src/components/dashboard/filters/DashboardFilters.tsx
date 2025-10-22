"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface DashboardFiltersProps {
  onFiltersChange?: (filters: DashboardFilters) => void;
  className?: string;
}

export interface DashboardFilters {
  dateRange?: DateRange;
  leadStatus?: string;
  buyerStatus?: string;
  taskStatus?: string;
  offerStatus?: string;
}

export function DashboardFilters({ onFiltersChange, className }: DashboardFiltersProps) {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters: DashboardFilters = {};
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => updateFilters({ dateRange: range })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Lead Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lead Status</label>
          <Select
            value={filters.leadStatus || "all"}
            onValueChange={(value) => updateFilters({ leadStatus: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All lead statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buyer Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buyer Status</label>
          <Select
            value={filters.buyerStatus || "all"}
            onValueChange={(value) => updateFilters({ buyerStatus: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All buyer statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Status</label>
          <Select
            value={filters.taskStatus || "all"}
            onValueChange={(value) => updateFilters({ taskStatus: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All task statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Offer Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Offer Status</label>
          <Select
            value={filters.offerStatus || "all"}
            onValueChange={(value) => updateFilters({ offerStatus: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All offer statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}