"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { setupRoasterProfile } from "@/lib/actions/onboarding";
import { SPECIALTY_OPTIONS, EXPERIENCE_OPTIONS } from "@/lib/config/onboarding";
import { ROASTER_SPECIALTIES } from "@/lib/types/onboarding";

const roasterProfileSchema = z.object({
  specialties: z.array(z.enum(ROASTER_SPECIALTIES)).min(1, "Select at least one specialty"),
  languages: z.array(z.string()).min(1),
  experience: z.enum(['Beginner', 'Intermediate', 'Expert']),
  bio: z.string().max(500).optional(),
  portfolio: z.string().url().optional().or(z.literal(''))
});

type RoasterProfileForm = z.infer<typeof roasterProfileSchema>;

export function RoasterProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RoasterProfileForm>({
    resolver: zodResolver(roasterProfileSchema),
    defaultValues: {
      specialties: [],
      languages: ['French'],
      experience: 'Intermediate'
    }
  });

  const selectedSpecialties = watch('specialties') || [];
  const selectedExperience = watch('experience');
  const bioLength = watch('bio')?.length || 0;

  const toggleSpecialty = (specialtyId: string) => {
    const current = selectedSpecialties;
    const updated = current.includes(specialtyId as any)
      ? current.filter(id => id !== specialtyId)
      : [...current, specialtyId as any];
    setValue('specialties', updated);
  };

  const onSubmit = async (data: RoasterProfileForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await setupRoasterProfile(data);
      startTransition(() => {
        router.push('/onboarding/welcome');
      });
    } catch (error) {
      console.error('Profile setup error:', error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Specialties */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Your specialties</CardTitle>
          <p className="text-gray-500">What do you excel at? (multiple selection)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SPECIALTY_OPTIONS.map((specialty) => (
              <button
                key={specialty.id}
                type="button"
                onClick={() => toggleSpecialty(specialty.id)}
                data-testid={`specialty-${specialty.id}`}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedSpecialties.includes(specialty.id)
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{specialty.icon}</span>
                  <span className="text-sm font-medium">{specialty.label}</span>
                </div>
              </button>
            ))}
          </div>
          {errors.specialties && (
            <p className="text-red-600 text-sm mt-2">{errors.specialties.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Your experience level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedExperience === option.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                data-testid={`experience-${option.value}`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('experience')}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional Bio */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Bio (optional)</CardTitle>
          <p className="text-gray-500">Tell us about yourself in a few words</p>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('bio')}
            placeholder="Ex: UX Designer with 5 years of experience in B2B SaaS..."
            className="bg-white border-gray-300"
            rows={4}
            data-testid="bio-textarea"
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-right text-sm text-gray-500">
              {bioLength}/500
            </div>
            {errors.bio && (
              <p className="text-red-600 text-sm">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional Portfolio */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Portfolio/LinkedIn (optional)</CardTitle>
          <p className="text-gray-500">To reassure creators</p>
        </CardHeader>
        <CardContent>
          <Input
            {...register('portfolio')}
            placeholder="https://linkedin.com/in/yourprofile or https://yourportfolio.com"
            className="bg-white border-gray-300"
            data-testid="portfolio-input"
          />
          {errors.portfolio && (
            <p className="text-red-600 text-sm mt-1">{errors.portfolio.message}</p>
          )}
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
        {isLoading || isPending ? "Loading..." : "Finalize my profile"}
      </Button>
    </form>
  );
}