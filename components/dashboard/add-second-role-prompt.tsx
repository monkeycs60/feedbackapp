'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Star, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AddSecondRolePromptProps {
  currentRole: 'creator' | 'roaster';
}

export function AddSecondRolePrompt({ currentRole }: AddSecondRolePromptProps) {
  const oppositeRole = currentRole === 'creator' ? 'roaster' : 'creator';
  const oppositeRoleLabel = oppositeRole === 'creator' ? 'Creator' : 'Roaster';
  
  const benefits = currentRole === 'creator' 
    ? [
        'Give constructive feedback to other creators',
        'Monetize your UX/development expertise',
        'Learn from other projects',
        'Build your reputation in the community'
      ]
    : [
        'Get brutally honest feedback on your projects',
        'Improve your app with expert help',
        'Accelerate your product development',
        'Join a community of passionate creators'
      ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-400" />
              Unlock {oppositeRoleLabel} mode
            </CardTitle>
            <CardDescription className="mt-2">
              You're currently using RoastMyApp as a {currentRole === 'creator' ? 'Creator' : 'Roaster'}.
              Discover the other side of the platform!
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-purple-400/20 text-purple-300 border-purple-400/30">
            New
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
            {oppositeRole === 'creator' ? (
              <User className="h-8 w-8 text-blue-400 flex-shrink-0" />
            ) : (
              <Star className="h-8 w-8 text-purple-400 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-foreground">
                Become a {oppositeRoleLabel} too
              </p>
              <p className="text-sm text-muted-foreground">
                Access both sides of the platform and switch whenever you want
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              By becoming a {oppositeRoleLabel}, you'll be able to:
            </p>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/onboarding/role-selection?add_role=true">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              Add {oppositeRoleLabel} profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}