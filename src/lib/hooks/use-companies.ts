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
import type { NewCompany } from "@/lib/types";

export function useCompanies() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["company", "list"],
    queryFn: getCompaniesWithScores,
  });

  return {
    companies: data ?? [],
    isLoading,
    refresh: refetch,
  };
}

export function useCompanyDetail(companyId: number) {
  const companyQuery = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompany(companyId),
    enabled: !!companyId,
  });

  const scoreQuery = useQuery({
    queryKey: ["company-score", companyId],
    queryFn: () => getCompanyScore(companyId),
    enabled: !!companyId,
  });

  const contactsQuery = useQuery({
    queryKey: ["contact", "list", { companyId }],
    queryFn: () => getContactsForCompany(companyId),
    enabled: !!companyId,
  });

  const adjacentQuery = useQuery({
    queryKey: ["company-adjacent", companyId],
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
      queryClient.invalidateQueries({ queryKey: ["company", "list"] });
    },
  });

  const updateCompanyStatusMutation = useMutation({
    mutationFn: ({ companyId, status }: { companyId: number; status: string }) =>
      updateCompanyUserStatus(companyId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["company", "list"] });
    },
  });

  const deleteCompaniesMutation = useMutation({
    mutationFn: (companyIds: number[]) => deleteCompanies(companyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "list"] });
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
