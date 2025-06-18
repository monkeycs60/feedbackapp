import { requireOnboardingComplete } from '@/lib/auth-guards';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfilePage() {
  // Ensure user has completed onboarding and get user data
  const user = await requireOnboardingComplete();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Mon Profil
          </h1>
          <p className="text-gray-400">
            Gérez vos informations personnelles et paramètres de compte
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.name || "Non renseigné"}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Rôle principal</dt>
                <dd className="text-sm text-foreground sm:col-span-2 capitalize">
                  {user.primaryRole || "Non défini"}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">ID utilisateur</dt>
                <dd className="text-sm text-foreground sm:col-span-2 font-mono text-xs">
                  {user.id}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Onboarding</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.onboardingStep}/4 (Terminé)
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}