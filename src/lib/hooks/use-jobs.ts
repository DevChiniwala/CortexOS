import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobsActive, getJobsRecent, getJobById, killJob } from "@/lib/ipc";
import { queryKeys, STALE_TIME_REALTIME } from "@/lib/sync";
import type { Job } from "@/lib/types";

export function useJobs() {
  const activeQuery = useQuery({
    queryKey: queryKeys.jobs.active,
    queryFn: getJobsActive,
    staleTime: STALE_TIME_REALTIME,
    refetchInterval: 2000, // Poll active jobs
  });

  const recentQuery = useQuery({
    queryKey: queryKeys.jobs.recent,
    queryFn: () => getJobsRecent(10),
    staleTime: STALE_TIME_REALTIME,
  });

  return {
    activeJobs: activeQuery.data ?? [],
    recentJobs: recentQuery.data ?? [],
    isLoading: activeQuery.isLoading || recentQuery.isLoading,
    refresh: () => {
      activeQuery.refetch();
      recentQuery.refetch();
    },
  };
}

export function useJobDetail(jobId: string) {
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: queryKeys.jobs.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  });

  return {
    job: data ?? undefined,
    isLoading,
    error,
    refresh: refetch,
  };
}

export function useJobMutations() {
  const queryClient = useQueryClient();

  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => killJob(jobId),
    // Optimistic: mark job as cancelled immediately in the active list
    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.active });
      const previous = queryClient.getQueryData<Job[]>(queryKeys.jobs.active);

      if (previous) {
        queryClient.setQueryData<Job[]>(
          queryKeys.jobs.active,
          previous.filter((j) => j.id !== jobId)
        );
      }
      return { previous };
    },
    onError: (_err, _jobId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.jobs.active, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.recent });
    },
  });

  return {
    cancelJob: async (jobId: string) => cancelJobMutation.mutateAsync(jobId),
  };
}
