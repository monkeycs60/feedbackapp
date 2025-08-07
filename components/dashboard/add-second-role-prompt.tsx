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
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-md max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Plus className="h-4 w-4 text-orange-600" />
              Unlock {oppositeRoleLabel} mode
            </CardTitle>
            <CardDescription className="mt-1 text-slate-600 text-sm">
              Discover the other side of the platform!
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
            New
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            {oppositeRole === 'creator' ? (
              <User className="h-6 w-6 text-blue-600 flex-shrink-0" />
            ) : (
              <Star className="h-6 w-6 text-orange-600 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-slate-800 text-sm">
                Become a {oppositeRoleLabel} too
              </p>
              <p className="text-xs text-slate-600">
                Access both sides of the platform
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-700">
              Key benefits:
            </p>
            <ul className="space-y-0.5">
              {benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="flex items-start gap-1 text-xs text-slate-600">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/onboarding/role-selection?add_role=true">
            <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm">
              Add {oppositeRoleLabel} profile
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}