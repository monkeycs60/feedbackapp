"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setupCreatorProfile } from "@/lib/actions/onboarding";

interface CreatorProfileForm {
  company?: string;
}

export function CreatorProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<CreatorProfileForm>();

  const onSubmit = async (data: CreatorProfileForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await setupCreatorProfile(data);
      startTransition(() => {
        router.push('/onboarding/welcome');
      });
    } catch (error) {
      console.error('Erreur setup profil:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Ton entreprise/projet</CardTitle>
          <p className="text-gray-500">Optionnel - juste pour personnaliser ton expérience</p>
        </CardHeader>
        <CardContent>
          <Input
            {...register('company')}
            placeholder="Ex: MonStartup, Freelance, Projet perso..."
            className="bg-white border-gray-300"
            data-testid="company-input"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading || isPending}
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
      >
        {isLoading || isPending ? "Chargement..." : "C'est parti !"}
      </Button>
    </form>
  );
}