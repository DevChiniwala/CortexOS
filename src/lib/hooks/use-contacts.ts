import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllContacts,
  getContact,
  getAdjacentContacts,
  insertContact,
  updateContactUserStatus,
  deleteContacts,
  getAllCompanies,
} from "@/lib/ipc";
import type { NewContact } from "@/lib/types";

export function useContacts() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["contact", "list"],
    queryFn: getAllContacts,
  });

  return {
    contacts: data ?? [],
    isLoading,
    refresh: refetch,
  };
}

export function useCompaniesForSelect() {
  const { data, refetch } = useQuery({
    queryKey: ["company", "list", "select"],
    queryFn: getAllCompanies, // In a real app we might want a lighter query here
  });

  return {
    companies: data ?? [],
    refresh: refetch,
  };
}

export function useContactDetail(contactId: number) {
  const contactQuery = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => getContact(contactId),
    enabled: !!contactId,
  });

  const adjacentQuery = useQuery({
    queryKey: ["contact-adjacent", contactId],
    queryFn: () => getAdjacentContacts(contactId),
    enabled: !!contactId,
  });

  const isLoading = contactQuery.isLoading || adjacentQuery.isLoading;

  const refresh = async () => {
    await Promise.all([contactQuery.refetch(), adjacentQuery.refetch()]);
  };

  return {
    contact: contactQuery.data ?? undefined,
    adjacentContacts: adjacentQuery.data ?? undefined,
    isLoading,
    error: contactQuery.error || adjacentQuery.error,
    refresh,
  };
}

export function useContactMutations() {
  const queryClient = useQueryClient();

  const insertContactMutation = useMutation({
    mutationFn: (data: NewContact) => insertContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
    },
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: ({ contactId, status }: { contactId: number; status: string }) =>
      updateContactUserStatus(contactId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contact", variables.contactId] });
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
    },
  });

  const deleteContactsMutation = useMutation({
    mutationFn: (contactIds: number[]) => deleteContacts(contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
    },
  });

  return {
    insertContact: async (data: NewContact) => insertContactMutation.mutateAsync(data),
    updateContactStatus: async (contactId: number, status: string) =>
      updateContactStatusMutation.mutateAsync({ contactId, status }),
    deleteContacts: async (contactIds: number[]) =>
      deleteContactsMutation.mutateAsync(contactIds),
  };
}
