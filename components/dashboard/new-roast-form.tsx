"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FOCUS_AREAS, PRICE_RANGES, APP_CATEGORIES, type FocusArea, type AppCategory } from '@/lib/types/roast-request';
import { createRoastRequest } from '@/lib/actions/roast-request';

const formSchema = z.object({
  title: z.string().min(10, "Le titre doit faire au moins 10 caractères").max(100),
  appUrl: z.string().url("URL invalide"),
  description: z.string().min(50, "La description doit faire au moins 50 caractères").max(1000),
  targetAudience: z.string().min(10, "Décris ton audience cible").max(200),
  category: z.enum(['SaaS', 'Mobile', 'E-commerce', 'Landing', 'MVP', 'Autre']),
  focusAreas: z.array(z.string()).min(1, "Sélectionne au moins un domaine").max(4, "Maximum 4 domaines"),
  maxPrice: z.number().min(25).max(100),
  isUrgent: z.boolean(),
  additionalContext: z.string().max(500).optional()
});

type FormData = z.infer<typeof formSchema>;

export function NewRoastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focusAreas: [],
      maxPrice: 40,
      isUrgent: false,
      category: undefined
    }
  });

  const selectedFocusAreas = form.watch('focusAreas') || [];
  const selectedPrice = form.watch('maxPrice');
  const isUrgent = form.watch('isUrgent');
  const description = form.watch('description') || '';

  const toggleFocusArea = (areaId: string) => {
    const current = selectedFocusAreas;
    const updated = current.includes(areaId)
      ? current.filter(id => id !== areaId)
      : current.length < 4 ? [...current, areaId] : current;
    form.setValue('focusAreas', updated);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await createRoastRequest(data);
      // La redirection est gérée dans l'action
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Étape 1: Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            Présente ton app
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de ta demande</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Ex: Feedback sur l'onboarding de mon SaaS de gestion"
              className="mt-1"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="appUrl">URL de ton app</Label>
            <Input
              id="appUrl"
              {...form.register('appUrl')}
              placeholder="https://monapp.com"
              type="url"
              className="mt-1"
            />
            {form.formState.errors.appUrl && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.appUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <select 
              id="category"
              {...form.register('category')} 
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sélectionne une catégorie</option>
              {APP_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Étape 2: Description détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            Contexte et objectifs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description de ton app</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Décris ce que fait ton app, ses fonctionnalités principales, ce qui la rend unique..."
              rows={4}
              className="mt-1"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Min 50 caractères pour un feedback de qualité</span>
              <span>{description.length}/1000</span>
            </div>
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="targetAudience">Audience cible</Label>
            <Input
              id="targetAudience"
              {...form.register('targetAudience')}
              placeholder="Ex: PME françaises, freelances tech, entrepreneurs B2B..."
              className="mt-1"
            />
            {form.formState.errors.targetAudience && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.targetAudience.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Étape 3: Focus areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            Domaines de feedback
          </CardTitle>
          <p className="text-sm text-gray-600">Sélectionne 1 à 4 domaines (max 4)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area.id}
                type="button"
                data-testid={`focus-area-${area.id}`}
                onClick={() => toggleFocusArea(area.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedFocusAreas.includes(area.id)
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{area.icon}</span>
                  <div>
                    <div className="font-medium">{area.label}</div>
                    <div className="text-sm text-gray-600">{area.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {form.formState.errors.focusAreas && (
            <p className="text-red-500 text-sm mt-2">{form.formState.errors.focusAreas.message}</p>
          )}
          {selectedFocusAreas.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              {selectedFocusAreas.length}/4 domaines sélectionnés
            </div>
          )}
        </CardContent>
      </Card>

      {/* Étape 4: Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            Budget et priorité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Budget maximum</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  data-testid={`price-${range.value}`}
                  onClick={() => form.setValue('maxPrice', range.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedPrice === range.value
                      ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-lg">{range.label}</div>
                  <div className="text-sm text-gray-600">{range.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border">
            <div>
              <Label htmlFor="urgent" className="font-medium cursor-pointer">
                Demande urgente
              </Label>
              <p className="text-sm text-gray-600">Feedback sous 24h (+50% prix final)</p>
            </div>
            <Switch 
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => form.setValue('isUrgent', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => router.push('/dashboard')}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Publication...' : 'Publier la demande'}
        </Button>
      </div>
    </form>
  );
}