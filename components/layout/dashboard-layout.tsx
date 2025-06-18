"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  hasCreatorProfile?: boolean;
  hasRoasterProfile?: boolean;
}

export function DashboardLayout({ children, hasCreatorProfile = false, hasRoasterProfile = false }: DashboardLayoutProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [userProfiles, setUserProfiles] = useState({ hasCreator: hasCreatorProfile, hasRoaster: hasRoasterProfile });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch user profiles if not provided as props
  useEffect(() => {
    if (session?.user && (!hasCreatorProfile && !hasRoasterProfile)) {
      fetch('/api/user/profiles')
        .then(res => res.json())
        .then(data => {
          setUserProfiles({
            hasCreator: !!data.creatorProfile,
            hasRoaster: !!data.roasterProfile
          });
        })
        .catch(error => {
          console.error('Failed to fetch user profiles:', error);
        });
    } else if (hasCreatorProfile || hasRoasterProfile) {
      // Si au moins une prop est fournie, les utiliser
      setUserProfiles({
        hasCreator: hasCreatorProfile,
        hasRoaster: hasRoasterProfile
      });
    }
  }, [session, hasCreatorProfile, hasRoasterProfile]);

  if (isPending) {
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

  const finalCreatorProfile = hasCreatorProfile || userProfiles.hasCreator;
  const finalRoasterProfile = hasRoasterProfile || userProfiles.hasRoaster;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        hasCreatorProfile={finalCreatorProfile}
        hasRoasterProfile={finalRoasterProfile}
      />
      <main className="ml-64 pt-4 pb-8">
        <div className="container mx-auto px-6">
          {children}
        </div>
      </main>
    </div>
  );
}