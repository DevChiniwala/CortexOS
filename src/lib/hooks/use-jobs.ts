import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobsActive, getJobsRecent, getJobById, killJob } from "@/lib/ipc";

export function useJobs() {
  const activeQuery = useQuery({
    queryKey: ["jobs", "active"],
    queryFn: getJobsActive,
    refetchInterval: 2000, // Poll active jobs
  });

  const recentQuery = useQuery({
    queryKey: ["jobs", "recent"],
    queryFn: () => getJobsRecent(10),
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
    queryKey: ["job", jobId],
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
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "active"] });
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  return {
    cancelJob: async (jobId: string) => cancelJobMutation.mutateAsync(jobId),
  };
}
