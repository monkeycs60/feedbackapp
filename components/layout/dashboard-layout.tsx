"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useUserProfiles } from "@/lib/hooks/use-user-profiles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  hasCreatorProfile?: boolean;
  hasRoasterProfile?: boolean;
}

export function DashboardLayout({ children, hasCreatorProfile = false, hasRoasterProfile = false }: DashboardLayoutProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();
  const { data: profiles, isLoading: profilesLoading } = useUserProfiles();

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push("/login");
    }
  }, [session, sessionPending, router]);

  // Calculer les profils finaux en utilisant les props ou les données de React Query
  const finalCreatorProfile = hasCreatorProfile || !!profiles?.hasCreatorProfile;
  const finalRoasterProfile = hasRoasterProfile || !!profiles?.hasRoasterProfile;

  // Afficher le loader uniquement si la session est en cours de chargement
  // ou si les profiles sont en cours de chargement et qu'aucune prop n'est fournie
  const isLoading = sessionPending || (!hasCreatorProfile && !hasRoasterProfile && profilesLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-orange-500"></div>
          <span className="text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar 
        hasCreatorProfile={finalCreatorProfile}
        hasRoasterProfile={finalRoasterProfile}
      />
      <main className="ml-64 pt-4 pb-8 bg-gray-900">
        <div className="container mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}