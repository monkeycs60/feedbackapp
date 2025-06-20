"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  Home, 
  Plus, 
  Users, 
  Search,
  ArrowRightLeft,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { switchUserRole } from "@/lib/actions/onboarding";
import { useTransition } from "react";
import { useUserProfiles, useInvalidateUserProfiles } from "@/lib/hooks/use-user-profiles";

interface SidebarProps {
  className?: string;
  hasCreatorProfile?: boolean;
  hasRoasterProfile?: boolean;
}

export function Sidebar({ className, hasCreatorProfile = false, hasRoasterProfile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const { data: profiles } = useUserProfiles();
  const invalidateUserProfiles = useInvalidateUserProfiles();

  if (!session?.user) return null;

  // Use profiles from React Query if available, fallback to props
  const currentRole = profiles?.primaryRole || 'creator';
  const finalHasCreatorProfile = profiles?.hasCreatorProfile ?? hasCreatorProfile;
  const finalHasRoasterProfile = profiles?.hasRoasterProfile ?? hasRoasterProfile;
  const canSwitchRoles = finalHasCreatorProfile && finalHasRoasterProfile;
  
  const handleRoleSwitch = () => {
    const newRole = currentRole === 'creator' ? 'roaster' : 'creator';
    
    startTransition(async () => {
      try {
        await switchUserRole(newRole);
        
        // Invalidate the user profiles cache to refetch
        invalidateUserProfiles();
        
        // Refresh the router to update the dashboard content
        router.refresh();

        //redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error('Erreur lors du changement de rôle:', error);
      }
    });
  };
  
  // Navigation items based on role
  const creatorItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Vue d'ensemble"
    },
    {
      href: "/dashboard/new-roast",
      label: "Nouveau Roast",
      icon: Plus,
      description: "Créer une demande"
    }
  ];

  const roasterItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Vue d'ensemble"
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Search,
      description: "Roasts disponibles"
    }
  ];

  const commonItems = [
    {
      href: "/profile",
      label: "Profil",
      icon: Users,
      description: "Mon profil"
    }
  ];

  const navigationItems = currentRole === 'creator' ? creatorItems : roasterItems;

  return (
    <div className={cn(
      "flex h-full w-64 flex-col fixed left-0 top-16 bottom-0 bg-gray-900 border-r border-gray-800",
      className
    )}>
      {/* User info and role switch */}
      <div className="p-4 border-b border-gray-800 space-y-3">
        {/* User name and greeting */}
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            Salut {session.user.name} ! 👋
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              currentRole === 'creator' ? "bg-orange-500" : "bg-blue-500"
            )} />
            <span className="text-sm text-gray-400">
              {currentRole === 'creator' ? 'Mode Créateur' : 'Mode Roaster'}
            </span>
          </div>
        </div>
        
        {/* Role switch */}
        {canSwitchRoles && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRoleSwitch}
            disabled={isPending}
            className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-gray-100"
          >
            {isPending ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-gray-500 border-t-orange-500 mr-2"></div>
                Changement...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-3 w-3 mr-2" />
                Passer en {currentRole === 'creator' ? 'Roaster' : 'Créateur'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={`nav-${currentRole}-${item.href}-${index}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group",
                  isActive 
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-orange-400" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-orange-400/70" : "text-gray-500"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-800 my-4" />

        {/* Common items */}
        <div className="space-y-1">
          {commonItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={`common-${item.href}-${index}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group",
                  isActive 
                    ? "bg-gray-800 text-gray-200" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-gray-300" : "text-gray-500 group-hover:text-gray-300"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-gray-400" : "text-gray-500"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Add second role link */}
        {!canSwitchRoles && (
          <>
            <div className="border-t border-gray-800 my-4" />
            <div className="space-y-1">
              <Link
                href="/onboarding/role-selection?add_role=true"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20"
              >
                <UserPlus className="h-4 w-4 flex-shrink-0 text-purple-400" />
                <div className="flex flex-col">
                  <span className="font-medium text-purple-300">
                    Deviens {currentRole === 'creator' ? 'Roaster' : 'Créateur'}
                  </span>
                  <span className="text-xs text-purple-400/70">
                    Débloquer l&apos;autre rôle
                  </span>
                </div>
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <div className="mb-1">RoastMyApp v1.0</div>
          <Link 
            href="/docs" 
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}