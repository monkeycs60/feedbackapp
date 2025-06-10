'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Star, ArrowRightLeft } from 'lucide-react';
import { switchUserRole } from '@/lib/actions/onboarding';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'creator' | 'roaster';

interface RoleSwitchProps {
  currentRole: UserRole;
  hasCreatorProfile: boolean;
  hasRoasterProfile: boolean;
}

export function RoleSwitch({ 
  currentRole, 
  hasCreatorProfile, 
  hasRoasterProfile 
}: RoleSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleSwitch = () => {
    const newRole = currentRole === 'creator' ? 'roaster' : 'creator';
    
    startTransition(async () => {
      try {
        setError(null);
        await switchUserRole(newRole);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du changement de rôle');
      }
    });
  };

  const targetRole = currentRole === 'creator' ? 'roaster' : 'creator';
  const targetRoleLabel = targetRole === 'creator' ? 'Créateur' : 'Roaster';
  const currentRoleLabel = currentRole === 'creator' ? 'Créateur' : 'Roaster';

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {currentRole === 'creator' ? (
            <User className="h-4 w-4 text-blue-600" />
          ) : (
            <Star className="h-4 w-4 text-purple-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            Mode {currentRoleLabel}
          </span>
          <Badge 
            variant="secondary" 
            className={currentRole === 'creator' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
          >
            Actuel
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRoleSwitch}
          disabled={isPending}
          className="flex items-center gap-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {isPending ? 'Changement...' : `Passer en ${targetRoleLabel}`}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 max-w-xs text-right">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500 max-w-xs text-right">
        Vous avez accès aux deux rôles. Changez quand vous voulez !
      </p>
    </div>
  );
}