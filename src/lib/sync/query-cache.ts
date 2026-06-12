// ============================================================================
// CortexOS — Query Cache Configuration
// Centralized TanStack Query cache settings, stale times, and retry logic.
// ============================================================================

import { QueryClient } from "@tanstack/react-query";
import { isTauriRuntime } from "@/lib/ipc/commands";

// ============================================================================
// Stale Time Constants (ms)
// ============================================================================

/** Data that rarely changes: settings, scoring configs */
export const STALE_TIME_STATIC = 5 * 60 * 1000; // 5 minutes

/** Data that changes moderately: company/contact lists */
export const STALE_TIME_ENTITY = 30 * 1000; // 30 seconds

/** Data that changes frequently: active jobs, logs */
export const STALE_TIME_REALTIME = 5 * 1000; // 5 seconds

/** Data that should always refetch: onboarding status */
export const STALE_TIME_ALWAYS = 0;

// ============================================================================
// Query Key Factories
// ============================================================================

export const queryKeys = {
  companies: {
    all: ["company", "list"] as const,
    detail: (id: number) => ["company", id] as const,
    score: (id: number) => ["company-score", id] as const,
    adjacent: (id: number) => ["company-adjacent", id] as const,
    unscored: ["company", "unscored"] as const,
  },
  contacts: {
    all: ["contact", "list"] as const,
    detail: (id: number) => ["contact", id] as const,
    forCompany: (companyId: number) => ["contact", "list", { companyId }] as const,
    adjacent: (id: number) => ["contact-adjacent", id] as const,
  },
  jobs: {
    active: ["jobs", "active"] as const,
    recent: ["jobs", "recent"] as const,
    detail: (id: string) => ["job", id] as const,
    logs: (id: string) => ["job-logs", id] as const,
  },
  settings: {
    all: ["settings"] as const,
    apollo: ["settings", "apollo"] as const,
    onboarding: ["onboarding"] as const,
  },
  prompts: {
    byType: (type: string) => ["prompt", type] as const,
  },
  scoring: {
    config: ["scoring-config"] as const,
  },
} as const;

// ============================================================================
// Query Client Factory
// ============================================================================

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time for all queries
        staleTime: STALE_TIME_ENTITY,

        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Retry failed queries up to 2 times
        retry: (failureCount, error) => {
          // Don't retry if not in Tauri (browser fallbacks don't fail transiently)
          if (!isTauriRuntime()) return false;
          // Don't retry on 4xx-equivalent errors
          if (error instanceof Error && error.message.includes("not found")) return false;
          return failureCount < 2;
        },

        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

        // Refetch when window regains focus (desktop app coming back to foreground)
        refetchOnWindowFocus: isTauriRuntime(),

        // Don't refetch on mount if data is fresh
        refetchOnMount: "always",
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

// ============================================================================
// Cache Warming
// ============================================================================

/**
 * Pre-fetch critical data on app startup to ensure instant UI.
 */
export async function warmCache(queryClient: QueryClient) {
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: queryKeys.companies.all,
      staleTime: STALE_TIME_ENTITY,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.contacts.all,
      staleTime: STALE_TIME_ENTITY,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.active,
      staleTime: STALE_TIME_REALTIME,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.settings.all,
      staleTime: STALE_TIME_STATIC,
    }),
  ];

  // Don't block startup on prefetch — fire and forget
  Promise.allSettled(prefetchPromises).catch(() => {
    // Silently handle prefetch failures
  });
}
