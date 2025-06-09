"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { ONBOARDING_MESSAGES } from "@/lib/config/onboarding";

interface WelcomeScreenProps {
  user: {
    primaryRole: string | null;
    roasterProfile?: any;
    creatorProfile?: any;
  };
}

export function WelcomeScreen({ user }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await completeOnboarding();
      // La redirection sera gérée par completeOnboarding()
    } catch (error) {
      console.error('Erreur finalisation:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      // Redirection manuelle en cas d'erreur
      const redirectUrl = user.primaryRole === 'roaster' ? '/marketplace' : '/dashboard';
      router.push(redirectUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const isRoaster = user.primaryRole === 'roaster';
  const config = ONBOARDING_MESSAGES[isRoaster ? 'roaster' : 'creator'];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">{isRoaster ? '🔥' : '🚀'}</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue dans RoastMyApp !
          </h1>
          <p className="text-xl text-gray-300">
            {config.welcome}
          </p>
        </div>

        {/* Next steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Tes prochaines étapes :
            </h3>
            <div className="space-y-3 text-left">
              {config.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview autre rôle */}
        <Card className="mb-8 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="font-semibold text-white">Bientôt disponible pour toi</h3>
            </div>
            <p className="text-gray-300 text-sm">
              {config.futureRole}
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 px-8"
        >
          {isLoading ? "Finalisation..." : config.ctaText}
        </Button>
      </div>
    </div>
  );
}