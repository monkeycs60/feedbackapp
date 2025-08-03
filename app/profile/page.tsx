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
            My Profile
          </h1>
          <p className="text-gray-400">
            Manage your personal information and account settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.name || "Not provided"}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Primary Role</dt>
                <dd className="text-sm text-foreground sm:col-span-2 capitalize">
                  {user.primaryRole || "Not defined"}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                <dd className="text-sm text-foreground sm:col-span-2 font-mono text-xs">
                  {user.id}
                </dd>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Onboarding</dt>
                <dd className="text-sm text-foreground sm:col-span-2">
                  {user.onboardingStep}/4 (Completed)
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}