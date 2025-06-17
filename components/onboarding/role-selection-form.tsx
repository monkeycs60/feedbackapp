"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleCard } from "./role-card";
import { selectPrimaryRole } from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface RoleSelectionFormProps {
  hasCreatorProfile?: boolean;
  hasRoasterProfile?: boolean;
}

export function RoleSelectionForm({ hasCreatorProfile = false, hasRoasterProfile = false }: RoleSelectionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isAddingSecondRole = searchParams.get('add_role') === 'true';
  
  // Pré-sélectionner automatiquement le rôle manquant si on ajoute un second rôle
  const missingRole = hasCreatorProfile && !hasRoasterProfile ? 'roaster' : 
                     !hasCreatorProfile && hasRoasterProfile ? 'creator' : null;
  
  const [selectedRole, setSelectedRole] = useState<'creator' | 'roaster' | null>(
    isAddingSecondRole && missingRole ? missingRole : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await selectPrimaryRole(selectedRole);
      startTransition(() => {
        router.push('/onboarding/profile-setup');
      });
    } catch (error) {
      console.error('Erreur sélection rôle:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
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
          isDisabled={isAddingSecondRole && hasCreatorProfile}
          disabledMessage="Tu as déjà un profil Créateur"
        />
        <RoleCard 
          role="roaster" 
          isSelected={selectedRole === 'roaster'}
          onSelect={setSelectedRole}
          isDisabled={isAddingSecondRole && hasRoasterProfile}
          disabledMessage="Tu as déjà un profil Roaster"
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
            disabled={isLoading || isPending}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 px-8"
          >
            {isLoading || isPending ? "Chargement..." : "Continuer"}
          </Button>
        </div>
      )}
    </div>
  );
}