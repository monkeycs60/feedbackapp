"use client";

import { useState } from "react";
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

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await completeOnboarding();
      // Redirection will be handled by completeOnboarding()
    } catch (error) {
      // Don't treat Next.js redirections as errors
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      
      console.error('Finalization error:', error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const isRoaster = user.primaryRole === 'roaster';
  const config = ONBOARDING_MESSAGES[isRoaster ? 'roaster' : 'creator'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">{isRoaster ? '🔥' : '🚀'}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RoastMyApp!
          </h1>
          <p className="text-xl text-gray-600">
            {config.welcome}
          </p>
        </div>

        {/* Next steps */}
        <Card className="mb-8 bg-white border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your next steps:
            </h3>
            <div className="space-y-3 text-left">
              {config.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview other role */}
        <Card className="mb-8 bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="font-semibold text-gray-900">Coming soon for you</h3>
            </div>
            <p className="text-gray-700 text-sm">
              {config.futureRole}
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 px-8"
        >
          {isLoading ? "Finalizing..." : config.ctaText}
        </Button>
      </div>
    </div>
  );
}