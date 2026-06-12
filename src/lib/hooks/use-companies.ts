import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompaniesWithScores,
  getCompany,
  getCompanyScore,
  getContactsForCompany,
  getAdjacentCompanies,
  insertCompany,
  updateCompanyUserStatus,
  deleteCompanies,
} from "@/lib/ipc";
import { queryKeys, STALE_TIME_ENTITY } from "@/lib/sync";
import { optimisticDelete } from "@/lib/sync/optimistic";
import type { NewCompany, CompanyWithScore } from "@/lib/types";

export function useCompanies() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: getCompaniesWithScores,
    staleTime: STALE_TIME_ENTITY,
  });

  return {
    companies: data ?? [],
    isLoading,
    refresh: refetch,
  };
}

export function useCompanyDetail(companyId: number) {
  const companyQuery = useQuery({
    queryKey: queryKeys.companies.detail(companyId),
    queryFn: () => getCompany(companyId),
    enabled: !!companyId,
  });

  const scoreQuery = useQuery({
    queryKey: queryKeys.companies.score(companyId),
    queryFn: () => getCompanyScore(companyId),
    enabled: !!companyId,
  });

  const contactsQuery = useQuery({
    queryKey: queryKeys.contacts.forCompany(companyId),
    queryFn: () => getContactsForCompany(companyId),
    enabled: !!companyId,
  });

  const adjacentQuery = useQuery({
    queryKey: queryKeys.companies.adjacent(companyId),
    queryFn: () => getAdjacentCompanies(companyId),
    enabled: !!companyId,
  });

  const isLoading =
    companyQuery.isLoading ||
    scoreQuery.isLoading ||
    contactsQuery.isLoading ||
    adjacentQuery.isLoading;

  const refresh = async () => {
    await Promise.all([
      companyQuery.refetch(),
      scoreQuery.refetch(),
      contactsQuery.refetch(),
      adjacentQuery.refetch(),
    ]);
  };

  return {
    company: companyQuery.data ?? undefined,
    score: scoreQuery.data ?? undefined,
    contacts: contactsQuery.data ?? [],
    adjacentCompanies: adjacentQuery.data ?? undefined,
    isLoading,
    error: companyQuery.error || scoreQuery.error || contactsQuery.error || adjacentQuery.error,
    refresh,
  };
}

export function useCompanyMutations() {
  const queryClient = useQueryClient();

  const insertCompanyMutation = useMutation({
    mutationFn: (data: NewCompany) => insertCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });

  const updateCompanyStatusMutation = useMutation({
    mutationFn: ({ companyId, status }: { companyId: number; status: string }) =>
      updateCompanyUserStatus(companyId, status),
    // Optimistic update: immediately reflect status change in the list
    onMutate: async ({ companyId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.companies.all });
      const previous = queryClient.getQueryData<CompanyWithScore[]>(queryKeys.companies.all);

      if (previous) {
        queryClient.setQueryData<CompanyWithScore[]>(
          queryKeys.companies.all,
          previous.map((c) =>
            c.id === companyId ? { ...c, userStatus: status } : c
          )
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.companies.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });

  const deleteCompaniesMutation = useMutation({
    mutationFn: (companyIds: number[]) => deleteCompanies(companyIds),
    // Optimistic delete: remove from list immediately
    onMutate: async (companyIds) => {
      const rollback = optimisticDelete<CompanyWithScore>(
        queryClient,
        [...queryKeys.companies.all],
        companyIds
      );
      return { rollback };
    },
    onError: (_err, _vars, context) => {
      context?.rollback.rollback();
    },
    onSettled: (_data, _err, _vars, context) => {
      context?.rollback.settle();
    },
  });

  return {
    insertCompany: async (data: NewCompany) => insertCompanyMutation.mutateAsync(data),
    updateCompanyStatus: async (companyId: number, status: string) =>
      updateCompanyStatusMutation.mutateAsync({ companyId, status }),
    deleteCompanies: async (companyIds: number[]) =>
      deleteCompaniesMutation.mutateAsync(companyIds),
  };
}
