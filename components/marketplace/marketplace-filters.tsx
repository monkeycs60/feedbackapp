'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import type { RoastFilters } from '@/lib/actions/roast-request';

interface MarketplaceFiltersProps {
  filters: RoastFilters;
  onFiltersChange: (filters: RoastFilters) => void;
  availableData: {
    domains: string[];
    targetAudiences: string[];
    questionTypes: string[];
    priceRange: { min: number; max: number };
  };
}

export function MarketplaceFilters({ filters, onFiltersChange, availableData }: MarketplaceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<RoastFilters>(filters);

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const handleStatusChange = (status: RoastFilters['applicationStatus']) => {
    setLocalFilters(prev => ({
      ...prev,
      applicationStatus: prev.applicationStatus === status ? undefined : status
    }));
  };

  const handleArrayFilterChange = (
    filterKey: 'domains' | 'targetAudiences' | 'questionTypes',
    value: string
  ) => {
    setLocalFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterKey]: newValues.length > 0 ? newValues : undefined
      };
    });
  };

  const handlePriceChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1]
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters: RoastFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtrer les missions</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Statut de candidature */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Statut</Label>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange('not_applied')}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  localFilters.applicationStatus === 'not_applied'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                Non postulé
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  localFilters.applicationStatus === 'in_progress'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  localFilters.applicationStatus === 'completed'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                Complété
              </button>
            </div>
          </div>

          {/* Domaines */}
          {availableData.domains.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Domaines</Label>
              <div className="space-y-2">
                {availableData.domains.map(domain => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`domain-${domain}`}
                      checked={localFilters.domains?.includes(domain) || false}
                      onCheckedChange={() => handleArrayFilterChange('domains', domain)}
                    />
                    <Label
                      htmlFor={`domain-${domain}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {domain}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience cible */}
          {availableData.targetAudiences.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Audience cible</Label>
              <div className="space-y-2">
                {availableData.targetAudiences.map(audience => (
                  <div key={audience} className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${audience}`}
                      checked={localFilters.targetAudiences?.includes(audience) || false}
                      onCheckedChange={() => handleArrayFilterChange('targetAudiences', audience)}
                    />
                    <Label
                      htmlFor={`audience-${audience}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {audience}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Types de questions */}
          {availableData.questionTypes.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Types de questions</Label>
              <div className="space-y-2">
                {availableData.questionTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`question-${type}`}
                      checked={localFilters.questionTypes?.includes(type) || false}
                      onCheckedChange={() => handleArrayFilterChange('questionTypes', type)}
                    />
                    <Label
                      htmlFor={`question-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prix */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Prix par feedback: {localFilters.minPrice || availableData.priceRange.min}€ - {localFilters.maxPrice || availableData.priceRange.max}€
            </Label>
            <Slider
              min={availableData.priceRange.min}
              max={availableData.priceRange.max}
              step={1}
              value={[
                localFilters.minPrice || availableData.priceRange.min,
                localFilters.maxPrice || availableData.priceRange.max
              ]}
              onValueChange={handlePriceChange}
              className="mt-3"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <Button onClick={applyFilters} className="flex-1">
            Appliquer les filtres
          </Button>
          <Button onClick={clearFilters} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}