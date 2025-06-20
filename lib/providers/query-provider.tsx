"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache pour 5 minutes par défaut
            staleTime: 5 * 60 * 1000,
            // Garde les données en cache pendant 10 minutes
            gcTime: 10 * 60 * 1000,
            // Réessayer une fois en cas d'échec
            retry: 1,
            // Désactive le refetch automatique sur window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}