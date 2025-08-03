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
        console.error('Role switch error:', error);
      }
    });
  };
  
  // Navigation items based on role
  const creatorItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview"
    },
    {
      href: "/dashboard/new-roast",
      label: "New Roast",
      icon: Plus,
      description: "Create request"
    }
  ];

  const roasterItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview"
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Search,
      description: "Available roasts"
    }
  ];

  const commonItems = [
    {
      href: "/profile",
      label: "Profile",
      icon: Users,
      description: "My profile"
    }
  ];

  const navigationItems = currentRole === 'creator' ? creatorItems : roasterItems;

  return (
    <div className={cn(
      "flex h-full w-64 flex-col fixed left-0 top-16 bottom-0 bg-background border-r border-border",
      className
    )}>
      {/* User info and role switch */}
      <div className="p-4 border-b border-border space-y-3">
        {/* User name and greeting */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Hi {session.user.name}! 👋
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              currentRole === 'creator' ? "bg-orange-500" : "bg-blue-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {currentRole === 'creator' ? 'Creator Mode' : 'Roaster Mode'}
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
            className="w-full bg-secondary border-border hover:bg-accent text-foreground hover:text-accent-foreground"
          >
            {isPending ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-muted border-t-orange-500 mr-2"></div>
                Switching...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-3 w-3 mr-2" />
                Switch to {currentRole === 'creator' ? 'Roaster' : 'Creator'}
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
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-orange-400" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-orange-400/70" : "text-muted-foreground/70"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-border my-4" />

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
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-muted-foreground" : "text-muted-foreground/70"
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
            <div className="border-t border-border my-4" />
            <div className="space-y-1">
              <Link
                href="/onboarding/role-selection?add_role=true"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20"
              >
                <UserPlus className="h-4 w-4 flex-shrink-0 text-purple-400" />
                <div className="flex flex-col">
                  <span className="font-medium text-purple-300">
                    Become {currentRole === 'creator' ? 'Roaster' : 'Creator'}
                  </span>
                  <span className="text-xs text-purple-400/70">
                    Unlock the other role
                  </span>
                </div>
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
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