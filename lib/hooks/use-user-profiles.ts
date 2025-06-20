import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export interface UserProfilesData {
  hasCreatorProfile: boolean;
  hasRoasterProfile: boolean;
  primaryRole: "creator" | "roaster" | null;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

async function fetchUserProfiles(): Promise<UserProfilesData | null> {
  const { data: session } = await authClient.getSession();
  
  if (!session?.user) {
    return null;
  }

  const response = await fetch("/api/user/profiles");
  
  if (!response.ok) {
    throw new Error("Failed to fetch user profiles");
  }

  return response.json();
}

export function useUserProfiles() {
  const { data: session } = authClient.useSession();
  
  return useQuery({
    queryKey: ["user-profiles", session?.user?.id],
    queryFn: fetchUserProfiles,
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for manual invalidation when needed (e.g., after role switch)
export function useInvalidateUserProfiles() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
  };
}