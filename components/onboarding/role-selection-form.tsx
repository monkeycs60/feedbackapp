"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleCard } from "./role-card";
import { selectPrimaryRole } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function RoleSelectionForm() {
  const [selectedRole, setSelectedRole] = useState<'creator' | 'roaster' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddingSecondRole = searchParams.get('add_role') === 'true';

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await selectPrimaryRole(selectedRole);
      router.push('/onboarding/profile-setup');
    } catch (error) {
      console.error('Erreur sélection rôle:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {isAddingSecondRole && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Tu es sur le point d&apos;ajouter un second profil à ton compte. 
            Cela te permettra de switcher entre les deux rôles quand tu veux !
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <RoleCard 
          role="creator"
          isSelected={selectedRole === 'creator'}
          onSelect={setSelectedRole}
        />
        <RoleCard 
          role="roaster" 
          isSelected={selectedRole === 'roaster'}
          onSelect={setSelectedRole}
        />
      </div>
      
      {error && (
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {selectedRole && (
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 px-8"
          >
            {isLoading ? "Création du profil..." : "Continuer"}
          </Button>
        </div>
      )}
    </div>
  );
}