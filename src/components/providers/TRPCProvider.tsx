"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/lib/trpc-client";

// Optimized cache configuration for performance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Intelligent caching with stale-while-revalidate pattern
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
      retry: (failureCount, error: any) => {
        // Smart retry logic based on error type
        if (error?.data?.code === 'UNAUTHORIZED') return false;
        if (error?.data?.code === 'FORBIDDEN') return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch when connection restored
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // Enhanced batching configuration
          maxURLLength: 2048, // Optimize for URL length limits
          // Batch requests within 10ms window for better performance
          batchRequestsLimit: 10,
          headers: () => ({
            // Add performance headers
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}