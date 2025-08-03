'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, X, Filter } from 'lucide-react';
import type { RoastFilters } from '@/lib/actions/roast-request';

interface MarketplaceFilterBarProps {
  filters: RoastFilters;
  onFiltersChange: (filters: RoastFilters) => void;
  availableData: {
    domains: string[];
    targetAudiences: string[];
    priceRange: { min: number; max: number };
  };
}

export function MarketplaceFilterBar({ filters, onFiltersChange, availableData }: MarketplaceFilterBarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || availableData.priceRange.min,
    filters.maxPrice || availableData.priceRange.max
  ]);

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const handleStatusChange = (status: RoastFilters['applicationStatus'] | undefined) => {
    onFiltersChange({
      ...filters,
      applicationStatus: status
    });
  };

  const handleArrayFilterChange = (
    filterKey: 'domains' | 'targetAudiences',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterKey] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [filterKey]: newValues.length > 0 ? newValues : undefined
    });
  };

  const handleDateFilterChange = (dateFilter: RoastFilters['dateFilter'] | undefined) => {
    onFiltersChange({
      ...filters,
      dateFilter
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const applyPriceFilter = () => {
    onFiltersChange({
      ...filters,
      minPrice: priceRange[0] === availableData.priceRange.min ? undefined : priceRange[0],
      maxPrice: priceRange[1] === availableData.priceRange.max ? undefined : priceRange[1]
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setPriceRange([availableData.priceRange.min, availableData.priceRange.max]);
  };

  const statusOptions = [
    { value: 'not_applied', label: 'Not applied' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_week', label: 'This week' },
    { value: 'last_month', label: 'This month' }
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status filter */}
        <Select value={filters.applicationStatus || 'all'} onValueChange={(value) => handleStatusChange(value === 'all' ? undefined : value as RoastFilters['applicationStatus'])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Domains filter */}
        {availableData.domains.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Domains
                {filters.domains && filters.domains.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.domains.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableData.domains.map(domain => (
                <DropdownMenuCheckboxItem
                  key={domain}
                  checked={filters.domains?.includes(domain) || false}
                  onCheckedChange={(checked) => handleArrayFilterChange('domains', domain, checked)}
                >
                  {domain}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Target audience filter */}
        {availableData.targetAudiences.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Audience
                {filters.targetAudiences && filters.targetAudiences.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {filters.targetAudiences.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableData.targetAudiences.map(audience => (
                <DropdownMenuCheckboxItem
                  key={audience}
                  checked={filters.targetAudiences?.includes(audience) || false}
                  onCheckedChange={(checked) => handleArrayFilterChange('targetAudiences', audience, checked)}
                >
                  {audience}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Date filter */}
        <Select value={filters.dateFilter || 'all'} onValueChange={(value) => handleDateFilterChange(value === 'all' ? undefined : value as RoastFilters['dateFilter'])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            {dateOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Price filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Price: €{priceRange[0]} - €{priceRange[1]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Price per feedback: €{priceRange[0]} - €{priceRange[1]}
                </Label>
              </div>
              <Slider
                min={availableData.priceRange.min}
                max={availableData.priceRange.max}
                step={1}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{availableData.priceRange.min}€</span>
                <span>{availableData.priceRange.max}€</span>
              </div>
              <Button onClick={applyPriceFilter} size="sm" className="w-full">
                Apply
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters button */}
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.applicationStatus && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find(s => s.value === filters.applicationStatus)?.label}
              <button
                onClick={() => handleStatusChange(undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.domains?.map(domain => (
            <Badge key={domain} variant="secondary" className="gap-1">
              {domain}
              <button
                onClick={() => handleArrayFilterChange('domains', domain, false)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.targetAudiences?.map(audience => (
            <Badge key={audience} variant="secondary" className="gap-1">
              {audience}
              <button
                onClick={() => handleArrayFilterChange('targetAudiences', audience, false)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.dateFilter && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateOptions.find(d => d.value === filters.dateFilter)?.label}
              <button
                onClick={() => handleDateFilterChange(undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Price: €{filters.minPrice || availableData.priceRange.min} - €{filters.maxPrice || availableData.priceRange.max}
              <button
                onClick={() => {
                  onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined });
                  setPriceRange([availableData.priceRange.min, availableData.priceRange.max]);
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}