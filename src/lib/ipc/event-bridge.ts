import { listen } from "@tauri-apps/api/event";
import { QueryClient } from "@tanstack/react-query";
import { isTauriRuntime } from "./commands";

// ============================================================================
// Cortex Nexus Event Bridge
// Listens for Tauri IPC events and invalidates TanStack Query caches
// ============================================================================

export interface EntityUpdatedPayload {
  entityType: string;
  id: number;
}

export interface EntityDeletedPayload {
  entityType: string;
  ids: number[];
}

export interface JobStatusChangedPayload {
  jobId: string;
  status: string;
  exitCode: number | null;
}

export interface JobLogsAppendedPayload {
  jobId: string;
  count: number;
  lastSequence: number;
}

export interface JobCreatedPayload {
  jobId: string;
  jobType: string;
  targetId: number | null;
}

/**
 * Initializes listeners for all backend events to keep frontend state synchronized.
 */
export async function setupEventBridge(queryClient: QueryClient) {
  if (!isTauriRuntime()) {
    console.warn("[Event Bridge] Tauri runtime not detected, skipping event bridge setup.");
    return () => {};
  }
  try {
    // Listen for entity updates (invalidates specific entity queries)
    const unlistenEntityUpdated = await listen<EntityUpdatedPayload>(
      "nexus:entity-updated",
      (event) => {
        const { entityType, id } = event.payload;
        console.debug(`[Nexus] Entity updated: ${entityType} ${id}`);
        
        queryClient.invalidateQueries({ queryKey: [entityType, id] });
        // Also invalidate lists containing this entity type
        queryClient.invalidateQueries({ queryKey: [entityType, "list"] });
      }
    );

    // Listen for entity deletions
    const unlistenEntityDeleted = await listen<EntityDeletedPayload>(
      "nexus:entity-deleted",
      (event) => {
        const { entityType, ids } = event.payload;
        console.debug(`[Nexus] Entity deleted: ${entityType}`, ids);
        
        queryClient.invalidateQueries({ queryKey: [entityType, "list"] });
        // Optionally remove specific queries from cache
        ids.forEach(id => {
          queryClient.removeQueries({ queryKey: [entityType, id] });
        });
      }
    );

    // Listen for job state changes
    const unlistenJobStatus = await listen<JobStatusChangedPayload>(
      "nexus:job-status-changed",
      (event) => {
        const { jobId, status } = event.payload;
        console.debug(`[Nexus] Job ${jobId} status changed to ${status}`);
        
        queryClient.invalidateQueries({ queryKey: ["jobs", "active"] });
        queryClient.invalidateQueries({ queryKey: ["jobs", "recent"] });
        queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      }
    );

    // Listen for new jobs created
    const unlistenJobCreated = await listen<JobCreatedPayload>(
      "nexus:job-created",
      (event) => {
        console.debug(`[Nexus] Job created: ${event.payload.jobId}`);
        queryClient.invalidateQueries({ queryKey: ["jobs", "active"] });
        queryClient.invalidateQueries({ queryKey: ["jobs", "recent"] });
      }
    );

    return () => {
      unlistenEntityUpdated();
      unlistenEntityDeleted();
      unlistenJobStatus();
      unlistenJobCreated();
    };
  } catch (err) {
    console.error("Failed to setup event bridge. Are you running in Tauri?", err);
    return () => {};
  }
}
