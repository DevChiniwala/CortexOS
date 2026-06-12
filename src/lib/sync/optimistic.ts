// ============================================================================
// CortexOS — Optimistic Mutation Helpers
// Provides type-safe optimistic update patterns for TanStack Query mutations.
// ============================================================================

import { QueryClient } from "@tanstack/react-query";

/**
 * Creates an optimistic update context for a list query.
 * Usage: call `prepare()` before mutation, `rollback()` on error.
 */
export function createOptimisticListUpdate<T extends { id: number | string }>(
  queryClient: QueryClient,
  queryKey: unknown[]
) {
  return {
    /** Snapshot current data and apply optimistic update */
    prepare(updater: (oldList: T[]) => T[]) {
      // Cancel in-flight queries to prevent overwrite
      queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previous = queryClient.getQueryData<T[]>(queryKey);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<T[]>(queryKey, updater(previous));
      }

      return { previous };
    },

    /** Rollback to snapshot on error */
    rollback(context: { previous: T[] | undefined }) {
      if (context?.previous) {
        queryClient.setQueryData<T[]>(queryKey, context.previous);
      }
    },

    /** Invalidate to refetch true server state */
    settle() {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Creates an optimistic update context for a single entity query.
 */
export function createOptimisticEntityUpdate<T>(
  queryClient: QueryClient,
  queryKey: unknown[]
) {
  return {
    prepare(updater: (old: T | undefined) => T | undefined) {
      queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<T>(queryKey);
      queryClient.setQueryData<T | undefined>(queryKey, updater(previous));
      return { previous };
    },

    rollback(context: { previous: T | undefined }) {
      queryClient.setQueryData<T | undefined>(queryKey, context?.previous);
    },

    settle() {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Optimistic delete: removes items from a list cache immediately.
 */
export function optimisticDelete<T extends { id: number | string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  idsToDelete: (number | string)[]
) {
  const idSet = new Set(idsToDelete);

  queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData<T[]>(queryKey);

  if (previous) {
    queryClient.setQueryData<T[]>(
      queryKey,
      previous.filter((item) => !idSet.has(item.id))
    );
  }

  return {
    rollback() {
      if (previous) {
        queryClient.setQueryData<T[]>(queryKey, previous);
      }
    },
    settle() {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}

/**
 * Optimistic insert: prepends a new item to a list cache immediately.
 */
export function optimisticInsert<T extends { id: number | string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  newItem: T
) {
  queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData<T[]>(queryKey);

  queryClient.setQueryData<T[]>(queryKey, [newItem, ...(previous ?? [])]);

  return {
    rollback() {
      if (previous) {
        queryClient.setQueryData<T[]>(queryKey, previous);
      }
    },
    settle() {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
